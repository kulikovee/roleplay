import AutoBindMethods from './AutoBindMethods.js';
import { Player, AI, AnimatedGameObject } from './GameObjects.js';

const isPlayerHelperNeeded = false;

export default class Units extends AutoBindMethods {
    constructor(scene) {
        super();

        this.scene = scene;
        this.units = [];
        this.player = undefined;
    }

    clearUnits() {
        this.units = [];
    }

    getUnits() {
        return this.units;
    }

    getAliveUnits() {
        return this.getUnits().filter(gameObject => gameObject.isAlive());
    }

    getPlayer() {
        return this.player;
    }

    createAnotherPlayer(id) {
        this.units[id] = {
            position: { set: () => null },
            rotation: { set: () => null },
        };

        return this.scene.loadObj({
            baseUrl: './public/assets/models/units/player',
            callback: (object) => {
                this.units[id] = object;
                this.scene.add(object);
            }
        });
    }

    createPlayer({
         onCreate = () => null,
         onKill = () => null,
         onDamageTaken = () => null,
         onDie = () => null,
         onMove = () => null,
     }) {
        const gameObjectsService = this.scene.gameObjectsService;

        return this.scene.loadGLTF({
            baseUrl: './public/assets/models/units/player',
            callback: (loadedModel) => {
                if (isPlayerHelperNeeded) {
                    var helper = new THREE.SkeletonHelper(gltf);
                    helper.material.linewidth = 4;
                    this.scene.add(helper);
                }

                const pointLight = new THREE.PointLight(0xffffff);
                pointLight.position.set(0, 10, 0);
                pointLight.distance = 50;
                pointLight.decay = 2;
                loadedModel.scene.add(pointLight);

                loadedModel.scene.position.set(0, 0.1, 0);

                const player = gameObjectsService.hookGameObject(new Player({
                    animations: loadedModel.animations,
                    object: loadedModel.scene,
                    input: this.scene.input,
                    complexAnimations: true,
                    checkWay: this.scene.colliders.checkWay,
                    onDamageTaken: () => {
                        this.scene.ui.updatePlayerLabels();
                        onDamageTaken();
                        this.scene.particles.loadParticles({
                            position: player.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                        });
                    },
                    onKill: (object) => {
                        this.player.params.experience += object.params.bounty;
                        this.player.params.money += object.params.bounty;
                        this.scene.ui.updatePlayerLabels();

                        onKill();
                    },
                    onDie: () => {
                        onDie();
                        window.setTimeout(() => {
                            this.scene.ui.showRestart();
                            this.scene.ui.exitPointerLock();
                            this.scene.ui.pause = true;
                        }, 2500);
                    },
                    onLevelUp: () => {
                        this.scene.ui.updatePlayerLabels();
                        this.scene.loadGLTF({
                            baseUrl: './public/assets/models/effects/level-up-alt/level-up',
                            noScene: true,
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
                        })
                    },
                    attack: () => gameObjectsService.attack(player),
                    fire: () => gameObjectsService.fire(player),
                    destroy: () => gameObjectsService.destroyGameObject(player),
                }));

                this.player = player;
                this.scene.camera.player = player;
                this.units.push(player);

                onCreate();
            }
        });
    }

    createAI() {
        const player = this.scene.getPlayer(),
            level = player.getLevel(),
            gameObjectsService = this.scene.gameObjectsService;

        this.scene.loadGLTF({
            baseUrl: './public/assets/models/units/enemy',
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
                    onDamageTaken: () => this.scene.particles.loadParticles({
                        position: badGuy.position.clone().add(new THREE.Vector3(0, 0.75, 0))
                    }),
                    onDie: () => this.scene.intervals.setTimeout(() => (
                        badGuy.isDead() && gameObjectsService.destroyGameObject(badGuy)
                    ), 30000),
                }));

                badGuy.position.set(
                    player.position.x + 100 * (Math.random() - 0.5),
                    0.1,
                    player.position.z + 100 * (Math.random() - 0.5)
                );

                this.units.push(badGuy);
            }
        });
    }
}