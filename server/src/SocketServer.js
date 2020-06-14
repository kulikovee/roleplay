const ws = require('ws');
const fs = require('fs');
const path = require('path');

const WebSocketServer = ws.Server;

class SocketServer {
	constructor(getGameObjectsFromScene, updateNetworkPlayers, restartServer, removeDisconnected) {
		this.createWebServer = this.createWebServer.bind(this);
		this.createSocketServer = this.createSocketServer.bind(this);
		this.saveUserData = this.saveUserData.bind(this);
		this.loadUserData = this.loadUserData.bind(this);
		this.startSocketServer = this.startSocketServer.bind(this);
		this.getConnectionId = this.getConnectionId.bind(this);
		this.updateGameObjects = this.updateGameObjects.bind(this);
		this.sendToConnection = this.sendToConnection.bind(this);
		this.send = this.send.bind(this);

		this.getGameObjectsFromScene = getGameObjectsFromScene;
		this.updateNetworkPlayers = updateNetworkPlayers;
		this.removeDisconnected = removeDisconnected;

		this.restartServer = () => {
			restartServer();
			Object.values(this.db.connections)
				.forEach(c => this.send(c, 'restartServer'));
		};

		const isProduction = process.env.NODE_ENV === 'production';

		this.config = {
			ssl: isProduction,
			port: 1337,
			sslKey: path.join(__dirname, './privkey.pem'),
			sslCertificate: path.join(__dirname, './fullchain.pem'),
			sessionsPath: path.join(__dirname, './sessions/'),
			debug: false
		};

		this.db = {
			sequenceId: 0,
			hostId: null,
			connections: {},
			players: {},
			gameObjects: [],
		};

		const socketServer = this.createSocketServer(this.config);
		this.startSocketServer(socketServer);
	}

	createWebServer(config) {
		const processRequest = function(req, res) {
			res.writeHead(200);
			res.end("All glory to WebSockets!\n");
		};

		if (config.ssl) {
			const sslParams = {
				key: fs.readFileSync(config.sslKey),
				cert: fs.readFileSync(config.sslCertificate),
			};

			return require('https').createServer(sslParams, processRequest).listen(config.port);
		} else {
			return require('http').createServer(processRequest).listen(config.port);
		}
	}

	createSocketServer(config) {
		const server = this.createWebServer(config);
		const webSocketServer = new WebSocketServer({ server });

		debug(`Server is running on port ${config.port}. SSL is ${config.ssl ? 'enabled' : 'disabled'}.`);

		return webSocketServer;
	}

	saveUserData(token, data) {
		try {
			if (!fs.existsSync(this.config.sessionsPath)) {
				fs.mkdirSync(this.config.sessionsPath);
			}

			fs.writeFileSync(`${this.config.sessionsPath}/${token}`, JSON.stringify(data));
			return true;
		} catch (e) {
			debug('Save user data error', e);
			return false;
		}
	}

	loadUserData(token) {
		const tokenPath = `${this.config.sessionsPath}/${token}`;

		try {
			if (fs.existsSync(tokenPath)) {
				return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
			}
		} catch (e) {
			debug('Load user data error', e);
		}

		return false;
	}

	getConnectionId(c) {
		return c._id;
	}

	updateGameObjects() {
		this.updateNetworkPlayers(this.db.players);
		this.db.gameObjects = this.getGameObjectsFromScene();
	}

	sendToConnection(connectionId) {
		this.updateGameObjects();

		const players = this.db.players;
		const connection = this.db.connections[connectionId];

		const gameObjects = this.db.gameObjects
			.filter(gameObject => gameObject.type !== 'player');

		const networkPlayers = Object.keys(players)
			.filter(playerConnectionId => playerConnectionId !== String(connectionId))
			.map(playerConnectionId => players[playerConnectionId]);

		this.send(connection, 'updateGameObjects', [].concat(gameObjects, networkPlayers));
	}

	send(connection, messageType, data) {
		connection.send(JSON.stringify({
			meta: {
				server: { version: 1 },
				role: this.getConnectionId(connection) === this.db.hostId ? 'host' : 'client',
				id: this.getConnectionId(connection),
				token: connection._meta.token,
				debug: this.config.debug,
			},
			data,
			messageType,
		}));
	}

	startSocketServer(socketServer) {
		const db = this.db;
		const getConnectionToken = c => c._meta.token;

		const {
			loadUserData,
			getConnectionId,
			restartServer,
			saveUserData,
			removeDisconnected,
			send,
			sendToConnection,
		} = this;

		const SAVE_TIME = 10000;
		const CONNECTION_TIMEOUT = 120 * 1000;

		setInterval(() => {
			Object.keys(db.players).forEach((connectionKey) => {
				const connectionId = Number(connectionKey);
				const connection = db.connections[connectionId];
				const connectionPlayer = db.players[getConnectionId(connection)];
				const token = getConnectionToken(connection);

				if (Date.now() - connection._lastMessageAt >= CONNECTION_TIMEOUT) {
					debug('Connection timed out, id:', connectionId);

					Object.values(db.connections).forEach((c) => {
						send(c, 'disconnected', { connectionId });
					});

					removeDisconnected(connectionId);
					delete db.players[connectionId];
				} else if (connectionPlayer && token) {
					saveUserData(token, connectionPlayer);
				}
			});
		}, SAVE_TIME);

		socketServer.on('connection', function(connection) {
			const id = ++db.sequenceId;

			debug('New connection, id:', id);

			db.connections[id] = connection;
			connection._meta = { id };
			connection._id = id;

			const onSocketClose = () => {
				const id = getConnectionId(connection);
				debug('Connection closed, id:', id);

				Object.values(db.connections).forEach((c) => {
					send(c, 'disconnected', { connectionId: id });
				});

				const connectionPlayer = db.players[id];
				const token = getConnectionToken(connection);

				if (connectionPlayer && token) {
					saveUserData(token, connectionPlayer);
				}

				removeDisconnected(id);
				delete db.connections[id];
				delete db.players[id];
			};

			const onSocketMessage = (message) => {
				const { data, messageType, meta } = JSON.parse(message);
				const connectionId = getConnectionId(connection);
				connection._lastMessageAt = Date.now();

				if (meta && meta.token && meta.token !== connection._meta.token) {
					connection._meta.token = meta.token;
				}

				const login = (token) => {
					const connectedWithTheToken = Object.values(db.connections)
						.filter(connection => getConnectionToken(connection) === token);

					if (connectedWithTheToken.length > 1) {
						send(connection, 'badLogin', 'Player with entered credentials is already connected');
						connection.close();
					} else {
						send(connection, 'setUserPlayer', loadUserData(connection._meta.token));
					}
				};

				const updatePlayerData = (player) => {
					db.players[connectionId] = player;
				};

				switch (messageType) {
					case 'login': {
						login(getConnectionToken(connection));
						break;
					}

					case 'updatePlayer': {
						// Process request
						updatePlayerData(data);
						// Send response
						sendToConnection(connectionId);
						break;
					}

					case 'restartServer': {
						restartServer();
						break;
					}
				}
			};

			connection.on('message', onSocketMessage);
			connection.on('close', onSocketClose);

			send(connection, 'handshake');
		});
	}
}

exports.SocketServer = SocketServer;
