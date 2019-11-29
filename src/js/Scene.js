import * as THREE from 'three';
import * as GLTFLoader from 'three-gltf-loader';
import AutoBindMethods from './AutoBindMethods';
import Camera from './Camera';
import Connection from './Connection';
import GameObjectsService from './GameObjects';
import Input from './Input';
import Intervals from './Intervals';
import LevelMap from './Levels/LevelMap';
import Colliders from './Colliders';
import Particles from './Particles';
import UI from './UI';
import Units from './Units';


export default class Scene extends AutoBindMethods {
    /**
     * @param {Renderer} renderer
     */
    constructor(renderer) {
        super();
        this.intervals = new Intervals(this);
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.colliders = new Colliders(this);
        this.units = new Units(this);
        this.camera = new Camera(this);
        this.input = new Input({
            onAction: () => this.level.onAction(),
            onExit: () => this.ui.openShop(),
            onZoom: zoom => this.camera.addY(zoom),
        });
        this.gameObjectsService = new GameObjectsService(this);
        this.ui = new UI(this);
        this.particles = new Particles(this);
        this.connection = new Connection(this, 'gohtml.ru');
        this.level = new LevelMap(this);

        const area = new THREE.Vector3(100, 25, 100);

        this.particles.createParticles({
            particleCount: 10000,
            color: 0x888888,
            blending: THREE.NormalBlending,
            position: new THREE.Vector3(-area.x / 2, 0, -area.z / 2),
            getParticlePosition: (i, position = this.particles.getRandomPosition(area)) => {
                if (position.y < 0) {
                    const newPosition = this.particles.getRandomPosition(area);
                    position.x = newPosition.x;
                    position.y = area.y;
                    position.z = newPosition.z;
                }

                return position;
            }
        });

        this.clearScene();
        this.animate();

        console.log('Scene', this);
    }

    clearScene() {
        this.gameObjectsService.removeAll();
        this.units.createPlayer({
            onCreate: () => {
                this.ui.updatePlayerLabels();
            }
        });
    }

    animate() {
        this.intervals.update();

        if (!this.ui.pause) {
            this.gameObjectsService.update();
            this.camera.update();
            this.ui.update();
            this.input.update();
            this.level.update();
            this.particles.update();
            this.connection.send(this.getPlayer());
        }

        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(this.animate);
    }

    getPlayer() {
        return this.units.getPlayer();
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
        const loader = new GLTFLoader();
        const url = `${params.baseUrl}.glb${params.isGLTF ? '.gltf' : ''}`;

        loader.load(url, (loadedModel) => {
            params.callback && params.callback(loadedModel);

            if (!params.noScene) {
                this.add(loadedModel.scene);
            }
        });
    }
}
