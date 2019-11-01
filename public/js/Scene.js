import Input from './Input.js';
import UI from './UI.js';
import Camera from './Camera.js';
import GameObjectsService, { Player } from './GameObjects.js';
import Connection from "./Connection.js";

export default class Scene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new Camera(this);
        this.input = new Input();
        this.gameObjectsService = new GameObjectsService(this);
        this.ui = new UI(this);
        this.players = {};
        this.connection = new Connection(this, 'gohtml.ru');

        this.scene.add(this.createSkybox());
        this.scene.add(this.createGlobalLight());

        this.animate = this.animate.bind(this);
        this.createGlobalLight = this.createGlobalLight.bind(this);
        this.createSkybox = this.createSkybox.bind(this);
        this.createCube = this.createCube.bind(this);
        this.loadObj = this.loadObj.bind(this);

        this.animate();
    }

    animate() {
        if (!this.ui.pause) {
            this.gameObjectsService.update();
            this.camera.update();
            this.ui.update();
            this.input.update();
            this.connection.send(this.player);
        }

        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(this.animate);
    }

    setLevel(level) {
        this.level = level;
    }

    createGlobalLight() {
        const pivot = new THREE.Object3D();

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(100, 250, 250);
        pivot.add(pointLight);

        var ambientLight = new THREE.AmbientLight(0x303030);
        pivot.add(ambientLight);

        return pivot;
    }

    createSkybox() {
        const materialArray = ['RT', 'LF', 'UP', 'DN', 'FT', 'BK'].map(function (direction) {
            const url = `./public/assets/skybox${direction}.jpg`;
            return new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(url),
                side: THREE.BackSide
            });
        });

        const skyGeometry = new THREE.CubeGeometry(50000, 50000, 50000);
        const skyMaterial = new THREE.MeshFaceMaterial(materialArray);
        const skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

        return skyBox;
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
            this.scene.add(cube);
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

                this.scene.add(object);
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

    createCrossPivot() {
        const crossPivot = new THREE.Object3D();

        crossPivot.name = 'crossPivot';
        crossPivot.position.set(0, 0, 500);

        return crossPivot;
    }

    createAnotherPlayer(id) {
        this.players[id] = {
            position: {
                set: () => {
                },
            },
            rotation: {
                set: () => {
                },
            },
        };

        return this.loadObj({
            baseUrl: './public/assets/starship',
            callback: (object) => {
                this.players[id] = object;
                this.scene.add(object);
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

        return this.loadObj({
            baseUrl: './public/assets/starship',
            callback: (object) => {
                object.add(this.createCrossPivot());

                var emissiveFireLeft = this.createCube({
                    x: 0.4,
                    y: 0.1,
                    z: 0.1,
                    emissive: '#55aaff',
                    position: { x: 0.35, y: 1, z: -1.35 },
                    rotation: {},
                    noScene: true,
                });

                object.add(emissiveFireLeft);

                var emissiveFireRight = this.createCube({
                    x: 0.4,
                    y: 0.1,
                    z: 0.1,
                    emissive: '#55aaff',
                    position: { x: -0.35, y: 1, z: -1.35 },
                    rotation: {},
                    noScene: true,
                });

                object.add(emissiveFireRight);

                const player = gameObjectsService.hookGameObject(new Player({
                    object,
                    input: this.input,
                    speed: 0.09,
                    score: 500,
                    onDamageTaken: () => {
                        this.ui.updatePlayerLabels();
                        onDamageTaken();
                    },
                    onKill: (object) => {
                        this.player.params.kills += 1;
                        this.player.params.score += object.params.bounty;
                        this.ui.updatePlayerLabels();

                        if (this.player.params.kills % this.level.levelThreshold === 0) {
                            this.ui.openShop();
                        }
                        onKill();
                    },
                    onDie: () => {
                        this.ui.showRestart();
                        this.renderer.exitPointerLock();
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
