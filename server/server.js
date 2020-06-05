const config = {
	ssl: true,
	port: 1337,
	ssl_key: __dirname + '/privkey.pem',
	ssl_cert: __dirname + '/fullchain.pem',
};

const db = {
	hostId: null,
	debug: false,
	connections: {},
	sequenceId: 0,
	gameObjects: [],
	players: {},
};

const socketServer = createSocketServer(config);

function createSocketServer(config) {
	const WebSocketServer = require('ws').Server,
		fs = require('fs');

	const httpServ = config.ssl ? require('https') : require('http');

	let server = null;

	const processRequest = function(req, res) {
		res.writeHead(200);
		res.end("All glory to WebSockets!\n");
	};

	if (config.ssl) {
		server = httpServ.createServer({
			key: fs.readFileSync(config.ssl_key),
			cert: fs.readFileSync(config.ssl_cert),
		}, processRequest).listen(config.port);
	} else {
		server = httpServ.createServer(processRequest).listen(config.port);
	}

	const webSocketServer = new WebSocketServer({ server });
	console.log(`Server is running on port ${config.port}`);

	return webSocketServer;
}

const getConnectionId = c => c._id;

const send = (connection, messageType, data) => connection.send(JSON.stringify({
	meta: {
		server: { version: 1 },
		role: getConnectionId(connection) === db.hostId ? 'host' : 'client',
		id: getConnectionId(connection),
		debug: db.debug,
	},
	data,
	messageType,
}));

setInterval(() => {
	const isHost = connection => getConnectionId(connection) === db.hostId;

	Object.values(db.connections).forEach(connection => {
		const players = Object.keys(db.players)
			.filter(id => id !== getConnectionId(connection).toString())
			.map(id => db.players[id]);

		if (isHost(connection)) {
			send(connection, 'updateGameObjects', players);
		} else {
			send(connection, 'updateGameObjects', [...db.gameObjects, ...players]);
		}
	});
}, 100);

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
		const { data, messageType } = JSON.parse(message);
		const connectionId = getConnectionId(connection);

		const updateGameObjectsData = (gameObjects) => {
			if (connectionId === db.hostId) {
				db.gameObjects = gameObjects.filter(gameObject => gameObject.type !== 'player');

				const player = gameObjects.find(gameObject => gameObject.type === 'player');
				db.players[connectionId] = player;
			}
		};

		const updatePlayerData = (player) => {
			db.players[connectionId] = player;
		};

		switch (messageType) {
			case 'updateGameObjects': {
				updateGameObjectsData(data);
				break;
			}
			case 'updatePlayer': {
				updatePlayerData(data);
				break;
			}
		}
	};

	connection.on('message', onSocketMessage);
	connection.on('close', onSocketClose);

	send(connection, 'handshake');
});
