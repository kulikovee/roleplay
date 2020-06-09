import { MockGUI, MockRenderer } from './src/MockDependencies';
import SocketServer from './src/SocketServer';
import Scene from '../client/src/js/Scene';
import Connection from '../client/src/js/Connection';
import { Player } from '../client/src/js/GameObjects';

function Server() {
	debug('Starting server scene initialization ...');
	const scene = new Scene(MockRenderer, MockGUI);

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

	const player = scene.getPlayer();

	if (player) {
		player.params.hp = 0;
	}

	debug('Starting socket server ...');

	const getGameObjects = () => {
		const data = [];

		scene.units.getUnits().forEach((unit) => {
			if (!(unit instanceof Player)) {
				const unitData = Connection.unitToNetwork(unit, null, scene.location.id);

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
		debug('Restarting server ...');
		scene.connection.removeDisconnectedPlayer({ connectionId });
	};

	return new SocketServer(getGameObjects, updateNetworkPlayers, restartServer, removeDisconnected);
}

const server = new Server();

export default server;