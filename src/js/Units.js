import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';
import { Player, AI, AnimatedGameObject } from './GameObjects';

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
        const pivot = new THREE.Object3D();
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
                    onDamageDeal: damagedUnit => onDamageDeal(damagedUnit),
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

    createAI({ fraction, level, position: { x, y, z} }) {
        const gameObjectsService = this.scene.gameObjectsService;
        const getPriority = (unit, target) => (
            Number(target instanceof Player) * 0.75
            + 1 / Math.ceil(target.position.distanceTo(unit.position))
        );

        this.scene.models.loadGLTF({
            baseUrl: fraction === 'goats'
                ? './assets/models/units/goat-warrior'
                : './assets/models/units/enemy',
            callback: (gltf) => {
                /** @type {AI} */
                const ai = gameObjectsService.hookGameObject(new AI({
                    animations: gltf.animations,
                    object: gltf.scene,
                    speed: 0.04 + level * 0.005,
                    damage: 5 + level * 2.5,
                    hp: 70 + level * 30,
                    fraction,
                    checkWay: this.scene.colliders.checkWay,
                    getNextPoint: this.scene.pathFinder.getNextPoint,
                    attack: () => gameObjectsService.attack(ai),
                    onDamageTaken: () => this.scene.particles.loadEffect({
                        position: ai.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                    }),
                    onDie: () => this.scene.intervals.setTimeout(() => (
                        ai.isDead() && gameObjectsService.destroyGameObject(ai)
                    ), 10000),
                    isEnemy: unit => unit.fraction !== fraction,
                    findTarget: () => {
                        const priorityUnits = this.getAliveUnits()
                            .filter(unit => (
                                unit !== ai
                                && unit.getFraction() !== fraction
                                && unit.position.distanceTo(ai.position) < 20
                            ))
                            .sort((unitA, unitB) => getPriority(ai, unitB) - getPriority(ai, unitA));

                        return priorityUnits.length ? priorityUnits[0] : null;
                    },
                }));

                ai.position.set(x, y, z);
            }
        });
    }
}