const { MockGUI }  = require('./src/MockBrowserGlobals');
const { SocketServer } = require('./src/SocketServer');
const { unitToNetwork } = require('../common/Units');
const { initScene } = require('./dist/server-scene');

function Server() {
	var Canvas = require("canvas");
	var glContext = require('gl')(1,1); //headless-gl

	var canvasGL = new Canvas.Canvas(0, 0);
	canvasGL.addEventListener = function(event, func, bind_) {};

	const scene = initScene({ context: glContext, canvas: canvasGL }, MockGUI);

	setTimeout(
		() => {
			debug('Scene is loaded', {
				THREE: Boolean(THREE),
				document: Boolean(document),
				window: Boolean(window),
				GLTFLoader: Boolean(GLTFLoader),
				scene: Boolean(scene),
				sceneLocation: Boolean(scene.location),
				sceneColliders: scene.colliders.colliders.length,
				sceneAreas: scene.pathFinder.areas.length,
				units: scene.units.getUnits().length,
				aliveUnits: scene.units.getAliveUnits().length,
			});
		},
		5000,
	);

	const player = scene.getPlayer();

	if (player) {
		player.params.hp = 0;
	}

	debug('Starting socket server ...');

	const getGameObjects = () => {
		const data = [];

		scene.units.getUnits().forEach((unit) => {
			if (unit.params.type !== 'player') {
				const unitData = unitToNetwork(unit, null, scene.location.id);

				if (unitData) {
					data.push(unitData);
				}
			}
		});

		return data;
	};

	const updateNetworkPlayers = (networkPlayers) => {
		Object.values(networkPlayers)
			.forEach(scene.connection.updateNetworkPlayer);
	};

	const restartServer = () => {
		debug('Restarting server ...');
		scene.connection.clearLocalUnits();
		scene.location.createInteractiveGameObjects(true);
	};

	const removeDisconnected = (connectionId) => {
		debug('Remove disconnected ' + connectionId + ' ...');
		scene.connection.removeDisconnectedPlayer({ connectionId });
	};

	return new SocketServer(getGameObjects, updateNetworkPlayers, restartServer, removeDisconnected);
}

new Server();
