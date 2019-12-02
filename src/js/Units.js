import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';
import { Player, AI, AnimatedGameObject } from './GameObjects';

const isPlayerHelperNeeded = false;

// Extend from gameObjectsService
// TBD: GameLogicService
export default class Units extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.player = undefined;
    }

    getUnits() {
        return this.scene.gameObjectsService.getUnits();
    }

    getAliveUnits() {
        return this.getUnits().filter(gameObject => gameObject.isAlive());
    }

    getPlayer() {
        return this.player;
    }

    createAnotherPlayer(callback) {
        const pivot = new THREE.Object3d();
        const { hookGameObject } = this.scene.gameObjects;

        this.scene.models.loadGLTF({
            baseUrl: './assets/models/units/player',
            noScene: true,
            callback: (loadedObject) => hookGameObject(new AnimatedGameObject({
                object: loadedObject.scene,
                animations: loadedObject.animations,
                complexAnimations: true,
            })),
        });

        return pivot;
    }

    createPlayer({
         onCreate = () => null,
         onKill = () => null,
         onDamageDeal = () => null,
         onDamageTaken = () => null,
         onDie = () => null,
         onLevelUp = () => null,
     } = {}) {
        const gameObjectsService = this.scene.gameObjectsService;

        return this.scene.models.loadGLTF({
            baseUrl: './assets/models/units/player',
            callback: (loadedModel) => {
                loadedModel.scene.position.set(0, 0.1, 0);

                const player = gameObjectsService.hookGameObject(new Player({
                    animations: loadedModel.animations,
                    object: loadedModel.scene,
                    input: this.scene.input,
                    complexAnimations: true,
                    checkWay: this.scene.colliders.checkWay,
                    onDamageDeal: (damagedUnit) => {
                        this.scene.audio.playSound(player.position, 'Attack Soft');
                        onDamageDeal(damagedUnit)
                    },
                    onDamageTaken: (attacker) => {
                        onDamageTaken(attacker);
                        this.scene.particles.loadEffect({
                            position: player.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                        });
                    },
                    onKill: (object) => onKill(object),
                    onDie: (killer) => onDie(killer),
                    onLevelUp: () => {
                        this.scene.models.loadGLTF({
                            baseUrl: './assets/models/effects/level-up-alt/level-up',
                            noScene: true,
                            castShadow: false,
                            receiveShadow: false,
                            callback: loadedObject => {
                                loadedObject.scene.scale.set(1.5, 1.5, 1.5);

                                loadedObject.scene.traverse((child) => {
                                    if (child.isMesh) {
                                        child.material.transparent = true;
                                        child.material.alphaTest = 0.5;
                                    }
                                });

                                this.player.object.add(loadedObject.scene);

                                const effect = new AnimatedGameObject({
                                    object: loadedObject.scene,
                                    animations: loadedObject.animations,
                                });

                                this.scene.gameObjectsService.hookGameObject(effect);

                                this.scene.intervals.setTimeout(
                                    () => this.scene.gameObjectsService.destroyGameObject(effect),
                                    2080,
                                );
                            }
                        });

                        onLevelUp();
                    },
                    attack: () => gameObjectsService.attack(player),
                    fire: () => gameObjectsService.fire(player),
                    destroy: () => gameObjectsService.destroyGameObject(player),
                }));

                this.player = player;

                onCreate(player);
            }
        });
    }

    createAI({ position: { x, y, z}}) {
        const player = this.scene.getPlayer(),
            level = player.getLevel(),
            gameObjectsService = this.scene.gameObjectsService;

        this.scene.models.loadGLTF({
            baseUrl: './assets/models/units/enemy',
            callback: (gltf) => {
                /** @type {AI} */
                const badGuy = gameObjectsService.hookGameObject(new AI({
                    animations: gltf.animations,
                    object: gltf.scene,
                    target: this.scene.getPlayer(),
                    speed: 0.04 + level * 0.005,
                    damage: 5 + level * 2.5,
                    hp: 70 + level * 30,
                    checkWay: this.scene.colliders.checkWay,
                    attack: () => gameObjectsService.attack(badGuy),
                    onDamageDeal: () => this.scene.audio.playSound(badGuy.position, 'Attack Soft'),
                    onDamageTaken: () => this.scene.particles.loadEffect({
                        position: badGuy.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                    }),
                    onDie: () => this.scene.intervals.setTimeout(() => (
                        badGuy.isDead() && gameObjectsService.destroyGameObject(badGuy)
                    ), 30000),
                }));

                badGuy.position.set(x, y, z);
            }
        });
    }
}