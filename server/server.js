const config = {
	ssl: true,
	port: 1337,
	sslKey: __dirname + '/privkey.pem',
	sslCertificate: __dirname + '/fullchain.pem',
	sessionsPath: __dirname + '/sessions/',
	debug: false
};

const db = {
	sequenceId: 0,
	hostId: null,
	connections: {},
	players: {},
	gameObjects: [],
};

const WebSocketServer = require('ws').Server;
const fs = require('fs');

if (!fs.existsSync(config.sessionsPath)) {
	fs.mkdirSync(config.sessionsPath);
}

const saveUserData = (token, data) => {
	try {
		fs.writeFileSync(`${config.sessionsPath}/${token}`, JSON.stringify(data));
		return true;
	} catch (e) {
		console.log('Save user data error', e);
		return false;
	}
};

const loadUserData = (token) => {
	const tokenPath = `${config.sessionsPath}/${token}`;

	try {
		if (fs.existsSync(tokenPath)) {
			return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
		}
	} catch (e) {
		console.log('Load user data error', e);
	}

	return false;
};

const socketServer = createSocketServer(config);

function createSocketServer(config) {
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
	console.log(`Server is running on port ${config.port}`);

	return webSocketServer;
}

const getConnectionId = c => c._id;
const getConnectionToken = c => c._meta.token;

const send = (connection, messageType, data) => connection.send(JSON.stringify({
	meta: {
		server: { version: 1 },
		role: getConnectionId(connection) === db.hostId ? 'host' : 'client',
		id: getConnectionId(connection),
		token: connection._meta.token,
		debug: config.debug,
	},
	data,
	messageType,
}));

setInterval(() => {
	const isHost = connection => getConnectionId(connection) === db.hostId;

	Object.values(db.connections).forEach((connection) => {
		const connectionPlayer = db.players[getConnectionId(connection)];
		const networkPlayers = Object.values(db.players)
			.filter(player => player !== connectionPlayer);

		if (isHost(connection)) {
			send(connection, 'updateGameObjects', networkPlayers);
		} else {
			send(connection, 'updateGameObjects', [...db.gameObjects, ...networkPlayers]);
		}
	});
}, 100);


setInterval(() => {
	const isHost = connection => getConnectionId(connection) === db.hostId;

	Object.values(db.connections).forEach((connection) => {
		const connectionPlayer = db.players[getConnectionId(connection)];
		const token = getConnectionToken(connection);

		if (connectionPlayer && token) {
			saveUserData(token, connectionPlayer);
		}
	});
}, 10000);

socketServer.on('connection', function(connection) {
	const id = ++db.sequenceId;

	console.log('New connection, id:', id);

	db.connections[id] = connection;
	connection._meta = { id };
	connection._id = id;

	if (!db.hostId) {
		db.hostId = id;
		console.log('Host changed to', id);
	}

	const onSocketClose = () => {
		const id = getConnectionId(connection);
		console.log('Connection closed, id:', id);

		if (id === db.hostId) {
			const activeConnections = Object.values(db.connections).filter(c => c._id !== id);
			db.hostId = activeConnections.length ? activeConnections[0]._id : null;
			console.log('Host changed to', db.hostId);
		}

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
			console.log(`User #${connectionId} token changed from ${connection._meta.token} to ${meta.token}`);
			connection._meta.token = meta.token;
		}

		const updateGameObjectsData = (gameObjects) => {
			if (connectionId === db.hostId) {
				db.gameObjects = gameObjects.filter(gameObject => gameObject.type !== 'player');

				const player = gameObjects.find(gameObject => gameObject.type === 'player');
				db.players[connectionId] = player;
			}
		};

		const sendUserData = () => {
			send(connection, 'setUserPlayer', loadUserData(connection._meta.token));
		};

		const updatePlayerData = (player) => {
			db.players[connectionId] = player;
		};

		const takeHost = () => {
			console.log(`#${connectionId} takes the host`);
			db.hostId = connectionId;
		};

		const restartServer = () => {
			console.log(`#${connectionId} reloads server`);
			Object.values(db.connections).forEach(c => send(c, 'restartServer'));
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
