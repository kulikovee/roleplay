import { MockGUI, MockRenderer } from './src/MockDependencies';
import SocketServer from './src/SocketServer';
import Scene from '../client/src/js/Scene';

function Server() {
	debug('Starting server scene initialization ...');

	const scene = new Scene(MockRenderer, MockGUI);

	debug('Scene is loaded', {
		THREE: Boolean(THREE),
		document: Boolean(document),
		window: Boolean(window),
		GLTFLoader: Boolean(GLTFLoader),
		scene: Boolean(scene),
	});

	const logServerStatus = () => debug(
		'Server status ... Count alive units:',
		scene.units.getAliveUnits().length,
		'; is player loaded: ',
		Boolean(scene.units.getPlayer()),
		'; units positions: ',
		scene.units.getAliveUnits().map(u => [u.params.name, ': ', u.position]),
	);

	const startSocketServer = () => {
		debug('Starting socket server ...');
		this.socketServer = new SocketServer();
	};

	setTimeout(
		function init() {
			const player = scene.getPlayer();

			if (player) {
				player.params.hp = 0;
			}

			startSocketServer();
			setInterval(logServerStatus, 30000);
		},
		5000,
	);
}

export default Server;
