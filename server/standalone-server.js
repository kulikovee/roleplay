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
		aliveUnits: scene.units.getAliveUnits().length,
	});

	const player = scene.getPlayer();

	if (player) {
		player.params.hp = 0;
	}

	debug('Starting socket server ...');

	const getGameObjects = (networkPlayers) => {
		const data = [];

		scene.units.getAliveUnits().forEach((unit) => {
			if (!(unit instanceof Player)) {
				const unitData = Connection.unitToNetwork(unit, null, 'dream-town');

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

	return new SocketServer(getGameObjects, updateNetworkPlayers);
}

export default Server;
