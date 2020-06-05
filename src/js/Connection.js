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
		this.meta = meta;

		try {
			switch (messageType) {
				case 'handshake':
					// No action needed. Only meta update.
					break;
				case 'updateGameObjects':
					this.updateGameObjects(response);
					break;
				case 'disconnected':
					this.removeDisconnectedPlayer(response);
					break;
				// case 'setConnectionRole':
				//     this.setConnectionRole(response);
				//     break;
			}
		} catch (e) {
		}
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

	// TODO: Probably player.params.unitNetworkId is not the same as connection._id
	removeDisconnectedPlayer({ id }) {
		const gameObjectsService = this.scene.gameObjectsService;
		const disconnectedPlayer = gameObjectsService.getUnits().find(unit => unit.params.unitNetworkId === id);

		if (disconnectedPlayer) {
			gameObjectsService.destroyGameObject(disconnectedPlayer);
		}
	}

	updateNetworkPlayer({ locationName, position, rotation, params }) {
		const id = params.unitNetworkId;

		if (id === this.meta.id && !this.meta.debug) {
			return;
		}

		if (locationName !== this.scene.location.getLocationName()) {
			return;
		}

		/**
		 * @type Player | string
		 */
		let networkPlayer = this.networkPlayers[id];

		if (!networkPlayer) {
			this.networkPlayers[id] = 'loading';

			this.scene.units.createNetworkPlayer(id, (networkPlayer) => {
				this.networkPlayers[id] = networkPlayer;
			});
		} else if (networkPlayer !== 'loading') {
			networkPlayer.position.set(position.x, position.y, position.z);
			networkPlayer.rotation.set(rotation.x, rotation.y, rotation.z);

			if (params) {
				const { input, acceleration } = params;
				const playerParams = networkPlayer.params;

				playerParams.input.vertical = input.vertical;
				playerParams.input.horizontal = input.horizontal;
				playerParams.input.attack1 = input.attack1;
				playerParams.input.attack2 = input.attack2;
				playerParams.hp = params.hp;
				playerParams.hpMax = params.hpMax;
				playerParams.fraction = params.fraction;
				playerParams.damage = params.damage;
				playerParams.experience = networkPlayer.getExperience();
				playerParams.acceleration.set(acceleration.x, acceleration.y, acceleration.z);
			}
		}
	}

	updateNetworkAI(unitData) {
		const { locationName, position, rotation, animationState, scale, params } = unitData;
		const { unitNetworkId } = params;

		if (this.meta.role === 'host') {
			if (!this.meta.debug) {
				return;
			}
		} else {
			const gameObjectsService = this.scene.gameObjectsService;
			const player = this.scene.getPlayer();

			gameObjectsService.getUnits().forEach((unit) => {
				if (!unit.params.fromNetwork && unit !== player) {
					gameObjectsService.destroyGameObject(unit);
				}
			});
		}

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
			networkAI.animationState = animationState;

			if (params) {
				const { acceleration } = params;
				const networkAIParams = networkAI.params;

				networkAIParams.unitNetworkId = params.unitNetworkId;
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
		const id = this.meta.id;

		if (this.connection.readyState !== 1 || !id) {
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
					unit.params.unitNetworkId = 3 + Math.random().toString(32);
				}

				const unitNetworkId = unit.params.unitNetworkId;
				const {
					hp,
					hpMax,
					acceleration,
					damage,
					level,
					experience,
					fraction,
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
					position: vectorToObject(unit.position),
					rotation: vectorToObject(unitRotation),
					scale: vectorToObject(unit.object.scale),
					params: {
						unitNetworkId, hp, hpMax, fraction, damage, level, experience,
						acceleration: vectorToObject(acceleration),
						input: {
							vertical, horizontal,
							attack1, attack2,
						},
					},
				});
			}
		});

		const send = (messageType, data) => (
			this.connection.send(JSON.stringify({ messageType, data }))
		);

		if (this.meta.role === 'host') {
			send('updateGameObjects', data);
		} else {
			send('updatePlayer', data[0]);
		}
	}
}