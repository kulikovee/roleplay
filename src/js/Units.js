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

    setDefaultPlayerParams(defaultParams) {
        this.defaultParams = defaultParams;
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
                const defaultParams = this.defaultParams;
                loadedModel.scene.position.set(0, 0.1, 0);

                const player = gameObjectsService.hookGameObject(new Player({
                    animations: loadedModel.animations,
                    object: loadedModel.scene,
                    input: this.scene.input,
                    complexAnimations: true,
                    checkWay: this.scene.colliders.checkWay,
                    name: this.scene.user ? this.scene.user.userName : ' ',
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
                        this.scene.particles.createEffect({
                            effect: 'level-up-alt/level-up',
                            scale: 1.5,
                            attachTo: this.player.object,
                        });
                        onLevelUp();
                    },
                    attack: () => gameObjectsService.attack(player),
                    fire: () => gameObjectsService.fire(player),
                    destroy: () => gameObjectsService.destroyGameObject(player),
                }));

                this.player = player;
                onCreate(player);

                if (defaultParams && defaultParams.params) {
                    const { position, rotation, params } = defaultParams;
                    const playerParams = player.params;

                    player.position.set(position.x, position.y, position.z);
                    player.rotation.set(rotation.x, rotation.y, rotation.z);
                    playerParams.hp = params.hp;
                    playerParams.hpMax = params.hpMax;
                    playerParams.fraction = params.fraction;
                    playerParams.level = params.level;
                    playerParams.damage = params.damage;
                    playerParams.speed = params.speed;
                    playerParams.experience = params.experience;
                    playerParams.money = params.money;
                    playerParams.unspentTalents = params.unspentTalents;
                }
            }
        });
    }

    createAI({ fraction, level, position: { x, y, z }, rotation = {}, scale, onDie, name }) {
        const gameObjectsService = this.scene.gameObjectsService;
        const getPriority = (unit, target) => (
            (target instanceof Player ? 0.75 : 0)
            + 1 / Math.ceil(target.position.distanceTo(unit.position))
        );

        this.scene.models.loadGLTF({
            baseUrl: fraction === 'goats'
                ? './assets/models/units/goat-warrior'
                : './assets/models/units/enemy',
            callback: (gltf) => {
                const networkConnection = this.scene.connection;

                if (
                   !networkConnection
                   || !networkConnection.meta
                   || !networkConnection.meta.role
                   || networkConnection.meta.role === 'host'
                ) {
                    /** @type {AI} */
                    const ai = gameObjectsService.hookGameObject(new AI({
                        animations: gltf.animations,
                        object: gltf.scene,
                        speed: 0.35 + level * 0.025,
                        damage: 5 + level * 1.5,
                        hp: 70 + level * 30,
                        fraction,
                        name,
                        level,
                        checkWay: this.scene.colliders.checkWay,
                        getNextPoint: this.scene.pathFinder.getNextPoint,
                        attack: () => gameObjectsService.attack(ai),
                        onDamageTaken: () => this.scene.particles.loadEffect({
                            position: ai.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                        }),
                        onDie: () => this.scene.intervals.setTimeout(() => {
                            if (ai.isDead()) {
                                gameObjectsService.destroyGameObject(ai);

                                if (onDie) {
                                    onDie();
                                }
                            }
                        }, 10000),
                        findTarget: () => {
                            const nearEnemyUnits = this.getAliveUnits()
                               .filter(unit => (
                                  unit !== ai
                                  && unit.getFraction() !== fraction
                                  && unit.position.distanceTo(ai.position) < 15
                               ))
                               .sort((unitA, unitB) => getPriority(ai, unitB) - getPriority(ai, unitA));

                            return nearEnemyUnits.length ? nearEnemyUnits[0] : null;
                        },
                    }));

                    ai.position.set(x || 0, y || 0, z || 0);
                    ai.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);

                    if (scale) {
                        ai.object.scale.set(scale, scale, scale);
                    }
                }
            },
        });
    }

    createNetworkAI({ params: { fraction, unitNetworkId, level, name } }, callback) {
        const gameObjectsService = this.scene.gameObjectsService;

        return this.scene.models.loadGLTF({
            baseUrl: fraction === 'goats'
               ? './assets/models/units/goat-warrior'
               : './assets/models/units/enemy',
            callback: (loadedObject) => {
                const ai = gameObjectsService.hookGameObject(new AI({
                    object: loadedObject.scene,
                    animations: loadedObject.animations,
                    unitNetworkId,
                    fraction,
                    level,
                    name,
                    fromNetwork: true,
                    checkWay: this.scene.colliders.checkWay,
                    // getNextPoint: this.scene.pathFinder.getNextPoint,
                    attack: () => gameObjectsService.attack(ai),
                    onDamageTaken: () => this.scene.particles.loadEffect({
                        position: ai.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                    }),
                    onDie: () => this.scene.intervals.setTimeout(() => {
                        if (ai.isDead()) {
                            gameObjectsService.destroyGameObject(ai);
                        }
                    }, 10000),
                }));

                callback(ai);
            },
        });
    }

    createNetworkPlayer({ params: { connectionId, unitNetworkId, name } }, callback) {
        const gameObjectsService = this.scene.gameObjectsService;

        return this.scene.models.loadGLTF({
            baseUrl: './assets/models/units/network-player',
            callback: (loadedObject) => {
                const player = gameObjectsService.hookGameObject(new Player({
                    object: loadedObject.scene,
                    animations: loadedObject.animations,
                    unitNetworkId,
                    connectionId,
                    name,
                    fromNetwork: true,
                    complexAnimations: true,
                    checkWay: this.scene.colliders.checkWay,
                    input: {
                        network: true,
                        vertical: 0,
                        horizontal: 0,
                        jump: false,
                        cursor: {
                            x: 0,
                            y: 0,
                        },
                        look: {
                            vertical: 0,
                            horizontal: 0,
                        },
                    },
                    onDie: () => this.scene.intervals.setTimeout(() => {
                        if (player.isDead()) {
                            gameObjectsService.destroyGameObject(player);
                        }
                    }, 10000),
                }));

                callback(player);
            },
        });
    }
}