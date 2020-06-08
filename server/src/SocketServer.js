import * as ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';

const WebSocketServer = ws.Server;

class SocketServer {
	constructor() {
		this.createWebServer = this.createWebServer.bind(this);
		this.createSocketServer = this.createSocketServer.bind(this);
		this.saveUserData = this.saveUserData.bind(this);
		this.loadUserData = this.loadUserData.bind(this);
		this.startSocketServer = this.startSocketServer.bind(this);
		this.getConnectionId = this.getConnectionId.bind(this);
		this.sendGameObjectsToPlayers = this.sendGameObjectsToPlayers.bind(this);
		this.send = this.send.bind(this);

		const isProduction = process.env.NODE_ENV === 'production';

		this.config = {
			ssl: isProduction,
			port: 1337,
			sslKey: path.join(__dirname, './private.pem'),
			sslCertificate: path.join(__dirname, './fullchain.pem'),
			sessionsPath: path.join(__dirname, './sessions/'),
			debug: false
		};

		console.log(__dirname, fs.readdirSync(__dirname));

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

	sendGameObjectsToPlayers() {
		const players = this.db.players;
		const connections = this.db.connections;
		const gameObjects = this.db.gameObjects;

		Object.keys(connections).forEach((connectionId) => {
			const connection = connections[connectionId];
			const networkPlayers = Object.keys(players)
				.filter(playerConnectionId => playerConnectionId !== connectionId)
				.map(playerConnectionId => players[playerConnectionId]);

			this.send(connection, 'updateGameObjects', [...gameObjects, ...networkPlayers]);
		});
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
		const loadUserData = this.loadUserData;
		const getConnectionId = this.getConnectionId;
		const send = this.send;
		const getConnectionToken = c => c._meta.token;

		setInterval(() => {
			Object.values(db.connections).forEach((connection) => {
				const connectionPlayer = db.players[getConnectionId(connection)];
				const token = getConnectionToken(connection);

				if (connectionPlayer && token) {
					this.saveUserData(token, connectionPlayer);
				}
			});
		}, 10000);

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

				delete db.connections[id];
				delete db.players[id];
			};

			const onSocketMessage = (message) => {
				const { data, messageType, meta } = JSON.parse(message);
				const connectionId = getConnectionId(connection);

				if (meta && meta.token && meta.token !== connection._meta.token) {
					debug(`User #${connectionId} token changed from ${connection._meta.token} to ${meta.token}`);
					connection._meta.token = meta.token;
				}

				const sendUserData = () => {
					send(connection, 'setUserPlayer', loadUserData(connection._meta.token));
				};

				const updatePlayerData = (player) => {
					db.players[connectionId] = player;
				};

				switch (messageType) {
					case 'loadCurrentUser': {
						sendUserData();
						break;
					}

					case 'updatePlayer': {
						updatePlayerData(data);
						break;
					}

					case 'restartServer': {
						// restartServer();
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

export default SocketServer;
