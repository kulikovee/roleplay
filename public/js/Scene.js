import Input from './Input.js';
import UI from './UI.js';
import Camera from './Camera.js';
import GameObjectsService, { Player, Unit, AnimatedGameObject } from './GameObjects.js';
import Connection from './Connection.js';
import Particles from './Particles.js';
import LevelMap from './Levels/LevelMap.js';

const isPlayerHelperNeeded = false;

export default class Scene {
    /**
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        this.animate = this.animate.bind(this);
        this.createCube = this.createCube.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.clearScene = this.clearScene.bind(this);
        this.loadGLTF = this.loadGLTF.bind(this);

        this.players = {};
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new Camera(this);
        this.input = new Input({
            onAction: () => this.level.onAction(),
            onZoom: zoom => this.camera.addY(zoom),
        });
        this.gameObjectsService = new GameObjectsService(this);
        this.ui = new UI(this);
        this.particles = new Particles(this);
        this.connection = new Connection(this, 'gohtml.ru');
        this.level = new LevelMap(this);

        this.clearScene();
        this.animate();

        console.log('Scene', this);
    }

    clearScene() {
        this.gameObjectsService.removeAllGameObjects();
        this.createPlayer({
            onCreate: () => {
                this.ui.updatePlayerLabels();
            }
        });
    }

    animate() {
        if (!this.ui.pause) {
            this.gameObjectsService.update();
            this.camera.update();
            this.ui.update();
            this.input.update();
            this.level.update();
            this.particles.update();
            this.connection.send(this.player);
        }

        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(this.animate);
    }

    /**
     * @param {THREE.Object3D} object
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * @param {THREE.Object3D} object
     */
    remove(object) {
        this.scene.remove(object);
    }

    createCube(params) {
        params = params || {};

        const materialParams = {};

        if (params.image) {
            const texture = new THREE.TextureLoader().load(params.image);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(params.repeatX || 1, params.repeatY || 1);
            materialParams.map = texture;
        }

        if (params.emissive) {
            materialParams.emissive = new THREE.Color(params.emissive);
            materialParams.emissiveIntensity = 1.0;
            materialParams.emissiveMap = null;
        }

        const cube = new THREE.Mesh(
            new THREE.CubeGeometry(params.x || 1, params.y || 1, params.z || 1),
            new THREE.MeshLambertMaterial(materialParams)
        );

        if (params.position) {
            cube.position.set(
                params.position.x || 0,
                params.position.y || 0,
                params.position.z || 0
            );
        }

        if (params.rotation) {
            cube.rotation.set(
                params.rotation.x || 0,
                params.rotation.y || 0,
                params.rotation.z || 0
            );
        }

        if (!params.noScene) {
            this.add(cube);
        }

        return cube;
    }

    loadGLTF(params) {
        const loader = new THREE.GLTFLoader();
        const url = `${params.baseUrl}.glb${params.isGLTF ? '.gltf' : ''}`;

        loader.load(url, (loadedModel) => {
            params.callback && params.callback(loadedModel);

            if (!params.noScene) {
                this.add(loadedModel.scene);
            }
        });
    }

    createAnotherPlayer(id) {
        this.players[id] = {
            position: { set: () => null },
            rotation: { set: () => null },
        };

        return this.loadObj({
            baseUrl: './public/assets/models/units/player',
            callback: (object) => {
                this.players[id] = object;
                this.add(object);
            }
        });
    }

    createPlayer({
        onCreate = () => {},
        onKill = () => {},
        onDamageTaken = () => {},
        onDie = () => {},
        onMove = () => {},
    }) {
        const gameObjectsService = this.gameObjectsService;

        return this.loadGLTF({
            baseUrl: './public/assets/models/units/player',
            callback: (loadedModel) => {
                if (isPlayerHelperNeeded) {
                    var helper = new THREE.SkeletonHelper(gltf);
                    helper.material.linewidth = 4;
                    this.add(helper);
                }

                const player = gameObjectsService.hookGameObject(new Player({
                    animations: loadedModel.animations,
                    object: loadedModel.scene,
                    input: this.input,
                    complexAnimations: true,
                    onDamageTaken: () => {
                        this.ui.updatePlayerLabels();
                        onDamageTaken();
                    },
                    onKill: (object) => {
                        this.player.params.experience += object.params.bounty;
                        this.player.params.score += object.params.bounty;
                        this.ui.updatePlayerLabels();

                        onKill();
                    },
                    onDie: () => {
                        this.ui.showRestart();
                        this.ui.exitPointerLock();
                        this.ui.pause = true;
                        onDie();
                    },
                    onLevelUp: () => this.loadGLTF({
                        baseUrl: './public/assets/models/effects/level-up/level-up',
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

                            this.gameObjectsService.hookGameObject(effect);

                            setTimeout(() => this.gameObjectsService.destroyGameObject(effect), 2080);
                        }
                    }),
                    attack: () => {
                        this.gameObjectsService.gameObjects
                            .filter(gameObject => (
                                gameObject !== player
                                && gameObject instanceof Unit
                                && !gameObject.isDead()
                                && gameObject.position.distanceTo(player.position) < 2
                            ))
                            .forEach((collisionGameObject) => {
                                collisionGameObject.damageTaken({
                                    params: {
                                        damage: player.params.damage,
                                        parent: player
                                    }
                                })
                            });
                    },
                    fire: () => gameObjectsService.fire(player),
                    destroy: () => gameObjectsService.destroyGameObject(player),
                }));

                this.player = player;
                this.camera.player = player;

                onCreate();
            }
        });
    }
}
