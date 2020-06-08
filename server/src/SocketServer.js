import * as ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';

const WebSocketServer = ws.Server;

class SocketServer {
	constructor() {
		this.createSocketServer = this.createSocketServer.bind(this);
		this.saveUserData = this.saveUserData.bind(this);
		this.loadUserData = this.loadUserData.bind(this);

		this.config = {
			ssl: true,
			port: 1337,
			sslKey: path.join(__dirname, './private.key'),
			sslCertificate: path.join(__dirname, './fullchain.cert'),
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

	createSocketServer(config) {
		const httpServ = config.ssl ? require('https') : require('http');

		let server = null;

		const processRequest = function(req, res) {
			res.writeHead(200);
			res.end("All glory to WebSockets!\n");
		};

		if (config.ssl) {
			server = httpServ.createServer({
				key: fs.readFileSync(config.sslKey),
				cert: fs.readFileSync(config.sslCertificate),
			}, processRequest).listen(config.port);
		} else {
			server = httpServ.createServer(processRequest).listen(config.port);
		}

		const webSocketServer = new WebSocketServer({ server });
		debug(`Server is running on port ${config.port}`);

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

	startSocketServer(socketServer) {
		const getConnectionId = c => c._id;
		const getConnectionToken = c => c._meta.token;

		const send = (connection, messageType, data) => connection.send(JSON.stringify({
			meta: {
				server: { version: 1 },
				role: getConnectionId(connection) === this.db.hostId ? 'host' : 'client',
				id: getConnectionId(connection),
				token: connection._meta.token,
				debug: this.config.debug,
			},
			data,
			messageType,
		}));

		setInterval(() => {
			const isHost = connection => getConnectionId(connection) === this.db.hostId;

			Object.values(this.db.connections).forEach((connection) => {
				const connectionPlayer = this.db.players[getConnectionId(connection)];
				const networkPlayers = Object.values(this.db.players)
					.filter(player => player !== connectionPlayer);

				if (isHost(connection)) {
					send(connection, 'updateGameObjects', networkPlayers);
				} else {
					send(connection, 'updateGameObjects', [...this.db.gameObjects, ...networkPlayers]);
				}
			});
		}, 100);


		setInterval(() => {
			const isHost = connection => getConnectionId(connection) === this.db.hostId;

			Object.values(this.db.connections).forEach((connection) => {
				const connectionPlayer = this.db.players[getConnectionId(connection)];
				const token = getConnectionToken(connection);

				if (connectionPlayer && token) {
					this.saveUserData(token, connectionPlayer);
				}
			});
		}, 10000);

		socketServer.on('connection', function(connection) {
			const id = ++this.db.sequenceId;

			debug('New connection, id:', id);

			this.db.connections[id] = connection;
			connection._meta = { id };
			connection._id = id;

			if (!this.db.hostId) {
				this.db.hostId = id;
				debug('Host changed to', id);
			}

			const onSocketClose = () => {
				const id = getConnectionId(connection);
				debug('Connection closed, id:', id);

				if (id === this.db.hostId) {
					const activeConnections = Object.values(this.db.connections).filter(c => c._id !== id);
					this.db.hostId = activeConnections.length ? activeConnections[0]._id : null;
					debug('Host changed to', this.db.hostId);
				}

				Object.values(this.db.connections).forEach((c) => {
					send(c, 'disconnected', { connectionId: id });
				});

				delete this.db.connections[id];
				delete this.db.players[id];
			};

			const onSocketMessage = (message) => {
				const { data, messageType, meta } = JSON.parse(message);
				const connectionId = getConnectionId(connection);

				if (meta && meta.token && meta.token !== connection._meta.token) {
					debug(`User #${connectionId} token changed from ${connection._meta.token} to ${meta.token}`);
					connection._meta.token = meta.token;
				}

				const updateGameObjectsData = (gameObjects) => {
					if (connectionId === this.db.hostId) {
						this.db.gameObjects = gameObjects.filter(gameObject => gameObject.type !== 'player');

						const player = gameObjects.find(gameObject => gameObject.type === 'player');
						this.db.players[connectionId] = player;
					}
				};

				const sendUserData = () => {
					send(connection, 'setUserPlayer', this.loadUserData(connection._meta.token));
				};

				const updatePlayerData = (player) => {
					this.db.players[connectionId] = player;
				};

				const takeHost = () => {
					debug(`#${connectionId} takes the host`);
					this.db.hostId = connectionId;
				};

				const restartServer = () => {
					debug(`#${connectionId} reloads server`);
					Object.values(this.db.connections).forEach(c => send(c, 'restartServer'));
				};

				switch (messageType) {
					case 'loadCurrentUser': {
						sendUserData();
						break;
					}
					case 'updateGameObjects': {
						updateGameObjectsData(data);
						break;
					}
					case 'updatePlayer': {
						updatePlayerData(data);
						break;
					}
					case 'takeHost': {
						takeHost();
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

export default SocketServer;
