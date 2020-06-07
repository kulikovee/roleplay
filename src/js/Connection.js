import AutoBindMethods from './AutoBindMethods';
import { Player, AI } from './GameObjects';

export default class Connection extends AutoBindMethods {
	/**
	 * @param {Scene} scene
	 * @param {string|number} ip
	 * @param {string|number} port
	 * @param {boolean} isSecure
	 */
	constructor(scene, ip = 'localhost', port = '1337', isSecure = true) {
		super();
		this.scene = scene;
		this.meta = {};
		this.networkPlayers = {};
		this.networkAIs = {};

		const WebSocket = window.WebSocket || window.MozWebSocket;

		this.connection = new WebSocket(`${isSecure ? 'wss' : 'ws'}://${ip}:${port}`);
		this.connection.onopen = () => console.log('open connection');
		this.connection.onerror = (error) => console.log('error connection', error);
		this.connection.onmessage = this.onMessage;
	}

	update(time, deltaTime) {
		this.sendGameObjects();
	}

	onMessage({ data }) {
		/**
		 * @param {object} meta
		 * @param {any} response
		 * @param {string} messageType
		 */
		const { meta, data: response, messageType } = JSON.parse(data);

		if (this.meta.role !== meta.role) {
			this.scene.ui.setConnectionRole(meta.role);

			if (this.meta.role && meta.role === 'host') {
				this.hostUnitsFromNetwork();
			} else if (!this.meta.debug) {
				this.clearLocalGameObjects();
			}
		}

		this.meta = meta;

		try {
			switch (messageType) {
				case 'handshake': {
					this.processHandshake();
					break;
				}
				case 'restartServer': {
					window.location.reload();
					break;
				}
				case 'setUserPlayer': {
					const player = this.scene.getPlayer();

					if (player) {
						this.setPlayerParams(player, response);
					} else {
						this.scene.units.setDefaultPlayerParams(response);
					}
					break;
				}
				case 'updateGameObjects': {
					this.updateGameObjects(response);
					break;
				}
				case 'disconnected': {
					this.removeDisconnectedPlayer(response);
					break;
				}
			}
		} catch (e) {
			console.log('Connection error', e);
		}
	}

	takeHost() {
		this.send('takeHost');
	}

	restartServer() {
		this.send('restartServer');
	}

	// There is race condition between
	// clearLocalGameObjects and Location.createInteractiveGameObjects
	clearLocalGameObjects() {
		const gameObjectsService = this.scene.gameObjectsService;
		const player = this.scene.getPlayer();

		// Clear local gameObjects to replace them by network units (except player)
		gameObjectsService.getUnits().forEach((unit) => {
			if (!unit.params.fromNetwork && unit !== player) {
				gameObjectsService.destroyGameObject(unit);
			}
		});
	}

	send(messageType, data) {
		const { userName, password } = this.scene.user;

		const meta = {
			token: this.getHash(userName + password),
		};

		this.connection.send(JSON.stringify({ messageType, meta, data }))
	}

	processHandshake() {
		this.send('loadCurrentUser');
	}

	updateGameObjects(gameObjects) {
		gameObjects.forEach((gameObject) => {
			switch (gameObject.type) {
				case 'player': {
					this.updateNetworkPlayer(gameObject);
					break;
				}
				case 'ai': {
					this.updateNetworkAI(gameObject);
					break;
				}
			}
		});
	}

	removeDisconnectedPlayer({ connectionId }) {
		const gameObjectsService = this.scene.gameObjectsService;
		const disconnectedPlayer = gameObjectsService.getUnits().find(unit =>
			unit instanceof Player
			&& unit.params.connectionId === connectionId
		);

		console.log('Player disconnected', connectionId, disconnectedPlayer);

		if (disconnectedPlayer) {
			disconnectedPlayer.die();
		}
	}

	/**
	 * @param {String} str
	 * @returns {string}
	 */
	getHash(str) {
		function hash32(str) {
			let i;
			let l;
			let hval = 0x811c9dc5;

			for (i = 0, l = str.length; i < l; i++) {
				hval ^= str.charCodeAt(i);
				hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
			}

			return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
		}

		let h1 = hash32(str);
		return h1 + hash32(h1 + str);
	}

	hostUnitsFromNetwork() {
		this.scene.units
			.getAliveUnits()
			.forEach((unit) => {
				if (unit.params.fromNetwork) {
					unit.params.fromNetwork = false;
				}
			});
	}

	updateNetworkPlayer(playerData) {
		const { locationName, position, rotation, animationState, params } = playerData;
		const { params: { unitNetworkId } } = playerData;

		if (unitNetworkId === this.meta.unitNetworkId && !this.meta.debug) {
			return;
		}

		if (locationName !== this.scene.location.getLocationName()) {
			return;
		}

		/**
		 * @type Player | string
		 */
		let networkPlayer = this.networkPlayers[unitNetworkId];

		if (!networkPlayer) {
			this.networkPlayers[unitNetworkId] = 'loading';

			this.scene.units.createNetworkPlayer(
				playerData,
				(networkPlayer) => {
					this.networkPlayers[unitNetworkId] = networkPlayer;
				},
			);
		} else if (networkPlayer !== 'loading') {
			this.setPlayerParams(networkPlayer, { position, rotation, animationState, params });
		}
	}

	setPlayerParams(player, { position, rotation, animationState, params }) {
		player.position.set(position.x, position.y, position.z);
		player.rotation.set(rotation.x, rotation.y, rotation.z);
		player.animationState = animationState;

		if (params) {
			const { input, acceleration } = params;
			const playerParams = player.params;

			playerParams.input.vertical = input.vertical;
			playerParams.input.horizontal = input.horizontal;
			playerParams.input.attack1 = input.attack1;
			playerParams.input.attack2 = input.attack2;
			playerParams.hp = params.hp;
			playerParams.hpMax = params.hpMax;
			playerParams.fraction = params.fraction;
			playerParams.damage = params.damage;
			playerParams.speed = params.speed;
			playerParams.money = params.money;
			playerParams.level = params.level;
			playerParams.unspentTalents = params.unspentTalents;
			playerParams.experience = params.experience;
			playerParams.acceleration.set(acceleration.x, acceleration.y, acceleration.z);
		}
	}

	updateNetworkAI(unitData) {
		const { locationName, position, rotation, isRunning, isAttack, animationState, scale, params } = unitData;
		const { unitNetworkId } = params;

		if (locationName !== this.scene.location.getLocationName()) {
			return;
		}

		/**
		 * @type AI | string
		 */
		let networkAI = this.networkAIs[unitNetworkId];

		if (!networkAI) {
			this.networkAIs[unitNetworkId] = 'loading';

			this.scene.units.createNetworkAI(unitData, (networkAI) => {
				this.networkAIs[unitNetworkId] = networkAI;
			});
		} else if (networkAI !== 'loading') {
			networkAI.position.set(position.x, position.y, position.z);
			networkAI.rotation.set(rotation.x, rotation.y, rotation.z);
			networkAI.object.scale.set(scale.x, scale.y, scale.z);
			networkAI.isRunning = isRunning;
			networkAI.isAttack = isAttack;
			networkAI.animationState = animationState;

			if (params) {
				const { acceleration } = params;
				const networkAIParams = networkAI.params;

				networkAIParams.hp = params.hp;
				networkAIParams.hpMax = params.hpMax;
				networkAIParams.fraction = params.fraction;
				networkAIParams.damage = params.damage;
				networkAIParams.level = params.level;
				networkAIParams.acceleration.set(acceleration.x, acceleration.y, acceleration.z);
			}
		}
	}

	sendGameObjects() {
		const connectionId = this.meta.id;

		if (this.connection.readyState !== 1 || !connectionId) {
			return;
		}

		const player = this.scene.getPlayer();
		const units = (
			this.meta.role === 'host'
				? [
					player,
					...this.scene.units
						.getAliveUnits()
						.filter(unit => !unit.params.fromNetwork)
				]
				: [player]
		);

		const data = [];

		units.forEach((unit) => {
			if (unit) {
				const unitRotation = unit.object.rotation.toVector3();

				if (!unit.params.unitNetworkId) {
					const getRandomString = () => Math.random().toString(36).substr(2);
					unit.params.unitNetworkId = getRandomString() + getRandomString();
				}

				const unitNetworkId = unit.params.unitNetworkId;
				const {
					isRunning,
					isAttack,
				} = unit;
				const {
					hp,
					hpMax,
					acceleration,
					damage,
					level,
					experience,
					fraction,
					name,
					speed,
					unspentTalents,
					money,
				} = unit.params;

				const {
					vertical,
					horizontal,
					attack1,
					attack2,
				} = unit.params.input || {};

				const vectorToObject = (vector, eps = 1000) => ({
					x: Math.round(vector.x * eps) / eps,
					y: Math.round(vector.y * eps) / eps,
					z: Math.round(vector.z * eps) / eps,
				});

				data.push({
					type: unit instanceof Player ? 'player' : 'ai',
					locationName: this.scene.location.getLocationName(),
					animationState: unit.animationState,
					isRunning,
					isAttack,
					position: vectorToObject(unit.position),
					rotation: vectorToObject(unitRotation),
					scale: vectorToObject(unit.object.scale),
					params: {
						connectionId,
						unitNetworkId,
						name,
						hp,
						hpMax,
						fraction,
						damage,
						level,
						experience,
						speed,
						money,
						unspentTalents,
						acceleration: vectorToObject(acceleration),
						input: {
							vertical, horizontal,
							attack1, attack2,
						},
					},
				});
			}
		});

		if (this.meta.role === 'host') {
			this.send('updateGameObjects', data);
		} else if (data[0]) {
			this.send('updatePlayer', data[0]);
		}
	}
}