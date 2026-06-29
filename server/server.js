const { MockGUI, threeReady }  = require('./src/MockBrowserGlobals');
const { SocketServer } = require('./src/SocketServer');
const { unitToNetwork } = require('../common/Units');
const { initScene } = require('./dist/server-scene');

function Server() {
	// Headless simulation: no GL context is created (see Renderer headless mode), so the
	// server has no native canvas/headless-gl dependency and the scene is never drawn.
	const scene = initScene({ headless: true }, MockGUI);

	scene.location.onLoad = () => {
		debug('Scene is loaded', {
			THREE: Boolean(THREE),
			document: Boolean(document),
			window: Boolean(window),
			GLTFLoader: Boolean(GLTFLoader),
			scene: Boolean(scene),
			sceneLocation: Boolean(scene.location),
			locationLoaded: Boolean(scene.location.isLoaded),
			sceneColliders: scene.colliders.colliders.length,
			sceneAreas: scene.pathFinder.areas.length,
			units: scene.units.getUnits().length,
			aliveUnits: scene.units.getAliveUnits().length,
		});

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
	};
}

// Wait for three.js / GLTFLoader globals to be ready before booting the scene.
threeReady.then(() => new Server());
