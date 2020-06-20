import AutoBindMethods from './AutoBindMethods';
import AI from './GameObjects/AI';
import Player from './GameObjects/Player';
import Fire from './GameObjects/Fire';
import Unit from './GameObjects/Unit';
import AnimatedGameObject from './GameObjects/AnimatedGameObject';

export {
	AI,
	Player,
	Fire,
	Unit,
	AnimatedGameObject,
};

export default class GameObjectsService extends AutoBindMethods {
	/**
	 * @param {Scene} scene
	 */
	constructor(scene) {
		super();
		this.gameObjects = [];
		this.nextGameObjectId = 0;
		this.scene = scene;
	}

	update(time, deltaTime) {
		const player = this.scene.getPlayer();

		this.gameObjects
			.filter(go => (
				// Performance optimization
				this.scene.intervals.getTimePassed() < 30000
				|| !go.params.fromNetwork
				|| go.position.distanceTo(player.position) < 100
			))
			.forEach(gameObject => gameObject.update(time, deltaTime));
	}

	/**
	 * @param {Unit} attackingUnit
	 */
	attack(attackingUnit) {
		if (attackingUnit.isDead()) {
			return;
		}

		this.scene.intervals.setTimeout(() => {
			const gameTime = this.scene.intervals.getTimePassed();

			if (attackingUnit.isAttackInterrupted(gameTime)) {
				attackingUnit.releaseAttack(gameTime);
				return;
			}

			const attackedUnits = this.getUnits().filter(gameObject => (
				gameObject !== attackingUnit
				&& gameObject.isAlive()
				&& gameObject.isEnemy(attackingUnit)
				&& gameObject.position.distanceTo(attackingUnit.position) < 2
			));

			attackedUnits.forEach((collisionGameObject) => {
				collisionGameObject.damageTaken({
					damage: attackingUnit.getDamage(),
					unit: attackingUnit,
				}, gameTime)
			});

			// if (attackedUnits.length) {
			//     this.scene.audio.playSound(attackingUnit.position, 'Attack Soft');
			// }
		}, attackingUnit.getAttackTimeout());
	}

	/**
	 * @param {FiringUnit} firingGameObject
	 */
	fire(firingGameObject) {
		if (firingGameObject.isDead()) {
			return;
		}

		const object3d = this.scene.models.createGeometry({
			x: 0.1,
			y: 0.1,
			z: 0.1,
			emissive: '#ff1100',
			color: 0xff1100,
			localPosition: new THREE.Vector3(0, 0.1, 0),
			rotation: firingGameObject.getFireInitialRotation(),
			position: firingGameObject.getFireInitialPosition(),
			geometry: new THREE.SphereGeometry(1),
		});

		/**
		 * @type {Fire}
		 */
		const fireGameObject = this.hookGameObject(new Fire({
			object: object3d,
			speed: firingGameObject.params.fireShellSpeed,
			damage: firingGameObject.params.fireDamage,
			parent: firingGameObject,
			checkWay: this.scene.colliders.checkWay,
			getCollisions: () => this.scene.units
				.getAliveUnits()
				.filter(unit => (
					unit !== fireGameObject.params.parent
					&& unit.isEnemy(fireGameObject.params.parent)
					&& fireGameObject.position.distanceTo(unit.position) < 2
				)),
			destroy: () => this.destroyGameObject(fireGameObject),
		}));

		const particlesLifeTime = 0.5;

		const textureLoader = new THREE.TextureLoader();

		const particlesSpeed = 0.01;

		const fireParticles = this.scene.particles.createAttachedParticles({
			size: 1.5,
			count: 30,
			color: 0xff1100,
			lifeTime: particlesLifeTime,
			parent: fireGameObject.object,
			texture: textureLoader.load('./assets/textures/fire.png'),
			getDefaultParticleVelocity: () => new THREE.Vector3(
				Math.random() * particlesSpeed - particlesSpeed / 2,
				Math.random() * particlesSpeed * 1.5 + 0.02,
				Math.random() * particlesSpeed - particlesSpeed / 2,
			),
		});

		this.scene.intervals.setTimeout(
			() => {
				fireGameObject && this.destroyGameObject(fireGameObject);
				fireParticles.pause = true;

				this.scene.intervals.setTimeout(
					() => this.scene.particles.destroy(fireParticles),
					particlesLifeTime * 1500,
				);
			},
			2000,
		);

		// this.scene.audio.playSound(firingGameObject.position, 'Lasers');
	}

	createItem({
		scale = 1.5,
		model = 'item-heal',
		name,
		type,
		effects,
		position = {},
		boneName,
		attachModelName,
		onLoad,
		canPickup,
		onPickup,
	}) {
		const item = {
			name,
			type,
			effects,
			boneName,
			attachModelName,
			model,
		};

		this.scene.models.loadGLTF({
			baseUrl: './assets/models/items/' + model,
			noScene: true,
			callback: loadedObject => {
				const positionVector = new THREE.Vector3(position.x || 0, position.y || 0, position.z || 0);

				const object = loadedObject.scene;
				object.scale.set(scale, scale, scale);

				object.traverse((child) => {
					if (child.isMesh) {
						child.material.transparent = true;
						child.material.alphaTest = 0.5;
					}
				});

				object.position.set(positionVector.x, positionVector.y, positionVector.z);

				if (onLoad) {
					onLoad(object);
				}

				this.scene.scene.add(object);

				const gameItem = new AnimatedGameObject({
					object,
					animations: loadedObject.animations,
				});

				this.scene.gameObjectsService.hookGameObject(gameItem);

				const checkPickup = () => {
					this.scene.intervals.setTimeout(
						() => {
							const getPriority = unit => 1 / Math.ceil(positionVector.distanceTo(unit.position));
							const nearUnits = this.scene.units
								.getAliveUnits()
								.filter((unit) => (
									positionVector.distanceTo(unit.position) < 2
									&& (!canPickup || canPickup(unit))
								))
								.sort((unitA, unitB) => getPriority(unitB) - getPriority(unitA));

							if (nearUnits.length) {
								if (onPickup) {
									onPickup(nearUnits[0]);
								}

								gameItem.animationState.isDie = true;

								this.scene.intervals.setTimeout(
									() => this.scene.gameObjectsService.destroyGameObject(gameItem),
									500,
								);
							} else {
								checkPickup();
							}
						},
						1000,
					);
				};

				checkPickup();
			}
		});

		return item;
	}

	updateAttachedItems(unit) {
		if (!this.scene.isServer) {
			Object.values(unit.params.equippedItems)
				.filter(i => i)
				.forEach(equippedItem => {
					if (!unit._attachedModels[equippedItem.name]) {
						this.attachItem(unit, equippedItem);
					}
				});
		}
	}

	attachItem(unit, item) {
		let bone;

		const {
			boneName,
			name: itemName,
			attachModelName: modelName,
		} = item;

		unit._attachedModels[itemName] = {};

		this.scene.models.loadGLTF({
			baseUrl: './assets/models/items/' + modelName,
			noScene: true,
			callback: (loadedModel) => {
				const itemObject = loadedModel.scene;

				unit._attachedModels[itemName] = itemObject;

				unit.object.traverse(object => {
					if (object.name === boneName) {
						bone = object;
					}
				});

				if (bone) {
					bone.add(itemObject);
				}
			}
		});
	}

	dropItem(unit, item) {
		const attached = unit._attachedModels;
		const equipped = unit.params.equippedItems;
		const leftHand = equipped.leftHand;

		if (leftHand === item) {
			const {
				model,
				name,
				type,
				boneName,
				attachModelName,
				effects,
			} = item;

			equipped.leftHand = null;

			this.createWeaponItem({
				model,
				name,
				type,
				boneName,
				attachModelName,
				effects,
				position: unit.position.clone()
			});

			const attachedModel = attached[item.name];

			if (attachedModel) {
				const parent = attachedModel && attachedModel.parent;

				if (parent && parent.remove) {
					parent.remove(attachedModel);
				} else {
					console.error('Cannot find object parent of attached item to remove the object', attachedModel);
				}
			}
		}
	}

	createWeaponItem({
		model,
		name,
		type,
		boneName,
		attachModelName,
		effects,
		position,
		onPickup,
	}) {
		const item = this.scene.gameObjectsService.createItem({
			model,
			name,
			type,
			boneName,
			attachModelName,
			effects,
			position,

			canPickup: (pickingUnit) => {
				const { equippedItems } = pickingUnit.params;

				if (pickingUnit === this.scene.getPlayer() && !equippedItems.leftHand) {
					this.scene.notify('Press and Hold \'E\' to pickup \'' + item.name + '\'', 1000);
				}

				if (pickingUnit instanceof Player) {
					return pickingUnit.params.input && pickingUnit.params.input.isAction;
				}
			},
			onPickup: (pickingUnit) => {
				const { equippedItems } = pickingUnit.params;

				equippedItems.leftHand = item;
				this.scene.gameObjectsService.attachItem(pickingUnit, item);

				if (pickingUnit === this.scene.getPlayer()) {
					this.scene.notify('Press \'G\' if you need to drop \'' + item.name + '\'');
				}

				if (onPickup) {
					onPickup(pickingUnit);
				}
			},
		});
	}

	/**
	 * @param {GameObject} gameObject
	 */
	hookGameObject(gameObject) {
		this.gameObjects.push(gameObject);
		gameObject.__game_object_id = this.nextGameObjectId++;

		return gameObject;
	}

	removeAll() {
		while (this.gameObjects.length) {
			this.destroyGameObject(this.gameObjects[0]);
		}
	}

	removeAllExceptPlayer() {
		const getNextNonPlayerIndex = () => this.gameObjects.findIndex(go => go !== this.scene.getPlayer());
		let removeIdx = getNextNonPlayerIndex();

		while (removeIdx > -1) {
			const gameObject = this.gameObjects[removeIdx];
			this.gameObjects.splice(removeIdx, 1);

			this._removeGameObjectFromScene(gameObject);

			removeIdx = getNextNonPlayerIndex();
		}
	}

	/**
	 * @param {GameObject} gameObject
	 */
	destroyGameObject(gameObject) {
		const index = this.gameObjects.indexOf(gameObject);

		if (index > -1) {
			this.gameObjects.splice(index, 1);
		}

		this._removeGameObjectFromScene(gameObject);
	}

	/**
	 * @param {GameObject} gameObject
	 */
	_removeGameObjectFromScene(gameObject) {
		const parent = (gameObject.object && gameObject.object.parent) || this.scene;

		if (gameObject.__unit_hp_bar) {
			gameObject.__unit_hp_bar.remove();
			gameObject.__unit_hp_bar = null;
		}

		if (parent.remove) {
			parent.remove(gameObject.object);
		} else {
			console.error('Cannot find object parent to remove the object', gameObject);
		}
	}

	getUnits() {
		return this.gameObjects.filter(go => go instanceof Unit);
	}
}

