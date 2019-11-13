import Input from './Input.js';
import UI from './UI.js';
import Camera from './Camera.js';
import GameObjectsService, { Player } from './GameObjects.js';
import Connection from './Connection.js';
import LevelMap from './Levels/LevelMap.js';

export default class Scene {
    /**
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        this.animate = this.animate.bind(this);
        this.createCube = this.createCube.bind(this);
        this.loadObj = this.loadObj.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.clearScene = this.clearScene.bind(this);

        this.players = {};
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new Camera(this);
        this.input = new Input({ onAction: () => this.level.onAction() });
        this.gameObjectsService = new GameObjectsService(this);
        this.ui = new UI(this);
        this.connection = new Connection(this, 'gohtml.ru');
        this.level = new LevelMap(this);

        this.clearScene();
        this.animate();
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

    loadObj(params) {
        params = params || {};
        const baseUrl = params.baseUrl,
            callback = params.callback || function () {
            },
            done = (object) => {
                if (!this.loadObj[baseUrl]) {
                    this.loadObj[baseUrl] = object;
                }

                this.add(object);
                callback(object);
            };

        if (this.loadObj[baseUrl]) {
            return done(this.loadObj[baseUrl].clone());
        }

        return new THREE.MTLLoader().load(`${params.baseUrl}.mtl`, function (materials) {
            materials.preload();
            const loader = new THREE.OBJLoader();
            loader.setMaterials(materials);
            loader.load(`${params.baseUrl}.obj`, done);
        });
    }

    loadGLTF(params) {
        const loader = new THREE.GLTFLoader();

        loader.load(params.baseUrl, (gltf) => {
            params.callback && params.callback(gltf);
            this.add(gltf.scene);
        });
    }

    createAnotherPlayer(id) {
        this.players[id] = {
            position: { set: () => null },
            rotation: { set: () => null },
        };

        return this.loadObj({
            baseUrl: './public/assets/player',
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
            baseUrl: './public/assets/gltf/player.glb',
            callback: (gltf) => {
                // var helper = new THREE.SkeletonHelper(gltf.scene);
                // helper.material.linewidth = 3;
                // this.add(helper);

                const player = gameObjectsService.hookGameObject(new Player({
                    gltf,
                    object: gltf.scene,
                    input: this.input,
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
