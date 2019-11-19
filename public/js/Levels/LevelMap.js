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

        this.interval = setInterval(this.createBadGuyByTimeout, 500);
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

        this.scene.loadObj({
            baseUrl: './public/assets/hall',
            callback: (object) => pivot.add(object)
        });

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

        const skyGeometry = new THREE.CubeGeometry(75000, 75000, 75000);
        const skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        return new THREE.Mesh(skyGeometry, skyMaterial);
    }

    createBadGuyByTimeout() {
        const { player, ui: { pause }, gameObjectsService: { gameObjects } } = this.scene;

        if (!player || pause) {
            return;
        }

        const badGuyTimeout = 5000 - player.getLevel() * 500;
        const isBadGuyReleased = Date.now() - this.lastBadGuyCreated >= badGuyTimeout;
        const badGuysCount = gameObjects.filter(gameObject => gameObject instanceof AI).length;

        if (badGuysCount < 5 && isBadGuyReleased) {
            this.lastBadGuyCreated = Date.now();
            this.createBadGuy();
        }
    }

    createBadGuy() {
        const level = this.scene.player.getLevel(),
            player = this.scene.player,
            gameObjectsService = this.scene.gameObjectsService;

        this.scene.loadObj({
            baseUrl: './public/assets/enemy',
            callback: (object) => {
                const badGuy = gameObjectsService.hookGameObject(new AI({
                    object,
                    target: this.scene.player,
                    speed: 0.04 + level * 0.01 + player.params.speed * 0.5,
                    damage: 5 + level * 5,
                    hp: 140 + level * 30,
                    fire: () => null, // gameObjectsService.fire(badGuy),
                    destroy: () => gameObjectsService.destroyGameObject(badGuy),
                    onDamageTaken: () => this.scene.particles.createParticles({
                        position: object.position
                            .clone().add(new THREE.Vector3(0, 0.75, 0))
                    }),
                }));

                badGuy.position.set(
                    player.position.x + 100 * (Math.random() - 0.5),
                    player.position.y,
                    player.position.z + 100 * (Math.random() - 0.5)
                );
            }
        });
    }
}
