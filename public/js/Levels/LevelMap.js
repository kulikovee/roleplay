import AbstractLevel from './AbstractLevel.js';
import { AI } from '../GameObjects.js';

export default class LevelMap extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);

        this.startLevel = this.startLevel.bind(this);
        this.stopLevel = this.stopLevel.bind(this);
        this.restartLevel = this.restartLevel.bind(this);
        this.createBadGuyByTimeout = this.createBadGuyByTimeout.bind(this);
        this.createBadGuy = this.createBadGuy.bind(this);
        this.createEnvironment = this.createEnvironment.bind(this);
        this.createSkybox = this.createSkybox.bind(this);

        this.id = 'map';
        this.lastBadGuyCreated = Date.now();
        this.enviroment = this.createEnvironment();
        this.skybox = this.createSkybox();
        this.globalLight = this.createGlobalLight();

        this.scene.add(this.enviroment);
        this.scene.add(this.skybox);
        this.scene.add(this.globalLight);

        this.startLevel();
    }

    startLevel() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = this.scene.intervals.setInterval(this.createBadGuyByTimeout, 500);
        this.scene.ui.startGame();
        this.scene.ui.openShop();
    }

    restartLevel() {
        this.scene.clearScene();
    }

    stopLevel() {
        this.scene.remove(this.enviroment);
        this.scene.remove(this.skybox);
        this.scene.remove(this.globalLight);
        this.scene.gameObjectsService.removeAllGameObjectsExceptPlayer();
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    createEnvironment() {
        const pivot = new THREE.Object3D();

        this.scene.loadGLTF({
            baseUrl: './public/assets/models/enviroment/hall/hall',
            callback: object => pivot.add(object.scene)
        });

        return pivot;
    }

    createSkybox() {
        const materialArray = ['RT', 'LF', 'UP', 'DN', 'FT', 'BK'].map(function (direction) {
            const url = `./public/assets/textures/sky/skybox${direction}.jpg`;
            return new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(url),
                side: THREE.BackSide,
                fog: false,
            });
        });

        const skyGeometry = new THREE.CubeGeometry(75000, 75000, 75000);
        const skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        return new THREE.Mesh(skyGeometry, skyMaterial);
    }

    createBadGuyByTimeout() {
        const { player, ui: { pause }, gameObjectsService: { gameObjects } } = this.scene;

        if (!player || pause) {
            return;
        }

        const level = player.getLevel(),
            badGuyTimeout = 5000 - level * 500,
            isBadGuyReleased = Date.now() - this.lastBadGuyCreated >= badGuyTimeout,
            badGuysCount = gameObjects
                .filter(gameObject => gameObject instanceof AI && gameObject.isAlive())
                .length;

        if (badGuysCount < level && isBadGuyReleased) {
            this.lastBadGuyCreated = Date.now();
            this.createBadGuy();
        }
    }

    createBadGuy() {
        const player = this.scene.player,
            level = player.getLevel(),
            gameObjectsService = this.scene.gameObjectsService;

        this.scene.loadGLTF({
            baseUrl: './public/assets/models/units/enemy',
            callback: (gltf) => {
                /** @type {AI} */
                const badGuy = gameObjectsService.hookGameObject(new AI({
                    animations: gltf.animations,
                    object: gltf.scene,
                    target: this.scene.player,
                    speed: 0.04 + level * 0.005,
                    damage: 5 + level * 2.5,
                    hp: 70 + level * 30,
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
                    0,
                    player.position.z + 100 * (Math.random() - 0.5)
                );
            }
        });
    }
}
