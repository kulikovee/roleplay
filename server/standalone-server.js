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
	});

	const init = () => {
		const player = scene.getPlayer();

		if (player) {
			player.params.hp = 0;
		}

		debug('Starting socket server ...');
		const socketServer = new SocketServer();

		const updateGameObjects = () => {
			const data = [];

			scene.units.getAliveUnits()
				.filter(unit => !(unit instanceof Player))
				.forEach((unit) => {
					const unitData = Connection.unitToNetwork(unit, null, 'dream-town');

					if (unitData) {
						data.push(unitData);
					}
				});

			Object.values(socketServer.db.players)
				.forEach(scene.connection.updateNetworkPlayer);

			socketServer.db.gameObjects = data;
			socketServer.sendGameObjectsToPlayers();
		};

		setInterval(updateGameObjects, 100);
	};

	setTimeout(init,5000);
}

export default Server;
