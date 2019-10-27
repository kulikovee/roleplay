import Input from './Input.js';
import GameLogicService from './GameLogicService.js';
import UI from './UI.js';
import { MovingGameObject, Player } from './GameObjects.js';

export default class Scene {
    constructor(renderer) {
        this.scene = new THREE.Scene();
        this.camera = this.createCamera();
        this.input = new Input();
        this.renderer = renderer;
        this.gameLogicService = new GameLogicService(this);
        this.ui = new UI(this);

        this.scene.add(this.createSkybox());
        this.scene.add(this.createGlobalLight());

        this.animate = this.animate.bind(this);
        this.createGlobalLight = this.createGlobalLight.bind(this);
        this.createCamera = this.createCamera.bind(this);
        this.createSkybox = this.createSkybox.bind(this);
        this.createCube = this.createCube.bind(this);
        this.updateCameraPosition = this.updateCameraPosition.bind(this);
        this.loadObj = this.loadObj.bind(this);

        this.animate();
    }

    animate() {
        if (!this.ui.pause) {
            this.gameLogicService.update();
            this.updateCameraPosition();
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }

    setLevel(level) {
        this.level = level;
    }

    createGlobalLight() {
        const light = new THREE.PointLight(0xffffff);
        light.position.set(100, 250, 250);
        return light;
    }

    createCamera() {
        const ratio = window.innerWidth / window.innerHeight,
            camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);

        camera.position.set(5, 3, 15);

        return camera;
    }

    createSkybox() {
        const materialArray = ["RT", "LF", "UP", "DN", "FT", "BK"].map(function (dir) {
            const url = "https://gohtml.ru/assets/skybox" + dir + ".jpg";
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

        this.scene.add(cube);

        return cube;
    }

    updateCameraPosition() {
        if (!this.player) return;

        const cameraPosition = this.player.position.clone();

        cameraPosition.sub(
            this.player.getDirection(
                new THREE.Vector3(0, 0, window.innerHeight / 20)
            )
        );

        cameraPosition.y += 3;
        let distance = this.camera.position.distanceTo(cameraPosition);

        if (distance < 1) {
            distance = 1;
        }

        const speed = (25 / distance + 1) || 1;

        if (this.camera && this.camera.position && cameraPosition) {
            this.camera.position.sub(
                this.camera.position
                    .clone()
                    .sub(cameraPosition)
                    .multiplyScalar(1 / speed)
            );
        }

        this.camera.lookAt(this.player.object.position);
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

        new THREE.MTLLoader().load(params.baseUrl + ".mtl", function (materials) {
            materials.preload();
            const loader = new THREE.OBJLoader();
            loader.setMaterials(materials);
            loader.load(params.baseUrl + ".obj", done);
        });
    }

    createPlayer({
        onCreate = () => {},
        onKill = () => {},
        onAttacked = () => {},
        onDead = () => {},
    }) {
        this.loadObj({
            baseUrl: "https://gohtml.ru/assets/starship",
            callback: (object) => {
                this.player = this.gameLogicService.createGameObject(
                    Player,
                    object,
                    {
                        input: this.input,
                        speed: 0.09,
                        score: 500,
                        onAttacked: () => {
                            this.ui.updatePlayerLabels();
                            onAttacked();
                        },
                        onKill: (object) => {
                            this.player.kills += 1;
                            this.player.score += object.bounty;
                            this.ui.updatePlayerLabels();

                            if (this.player.kills % this.level.levelThreshold === 0) {
                                this.ui.openShop();
                            }
                            onKill();
                        },
                        onDead: () => {
                            this.ui.showRestart();
                            this.renderer.exitPointerLock();
                            this.ui.pause = true;
                            onDead();
                        }
                    }
                );

                onCreate();
            }
        });
    }
}
