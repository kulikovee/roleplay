import AbstractLevel from './AbstractLevel.js';
import { AI } from '../GameObjects.js';

export default class LevelMap extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);

        this.startLevel = this.startLevel.bind(this);
        this.createBadGuyByTimeout = this.createBadGuyByTimeout.bind(this);
        this.createBadGuy = this.createBadGuy.bind(this);
        this.createEnvironment = this.createEnvironment.bind(this);
        this.createSkybox = this.createSkybox.bind(this);

        this.id = 'level1';
        this.lastBadGuyCreated = Date.now();

        this.scene.add(this.createEnvironment());
        this.scene.add(this.createSkybox());
        this.scene.add(this.createGlobalLight());
    }

    startLevel() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(this.createBadGuyByTimeout, 500);
        this.scene.ui.startGame();
        this.scene.ui.openShop();
    }

    createEnvironment() {
        const pivot = new THREE.Object3D();

        this.scene.loadObj({
            baseUrl: './public/assets/shades',
            callback: (object) => {
                object.scale.set(750, 750, 750);
                pivot.add(object);
            }
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
        const player = this.scene.player,
            badGuyTimeout = 5000 - this.scene.player.getLevel() * 500;

        if (player && !this.scene.ui.pause && (Date.now() - this.lastBadGuyCreated >= badGuyTimeout)) {
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
                    fire: () => gameObjectsService.fire(badGuy),
                    destroy: () => gameObjectsService.destroyGameObject(badGuy),
                }));

                badGuy.position.set(
                    player.position.x + 1000 * (Math.random() - 0.5),
                    player.position.y + 1000 * (Math.random() - 0.5),
                    player.position.z + 1000 * (Math.random() - 0.5)
                );

                badGuy.object.scale.set(2.5, 2.5, 2.5);
            }
        });
    }
}
