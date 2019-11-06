import AbstractLevel from './AbstractLevel.js';
import LevelEarth from './LevelEarth.js';
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
        this.onAction = this.onAction.bind(this);
        this.showAction = this.showAction.bind(this);
        this.update = this.update.bind(this);
        this.createBadGuyByTimeout = this.createBadGuyByTimeout.bind(this);
        this.createBadGuy = this.createBadGuy.bind(this);
        this.createEnvironment = this.createEnvironment.bind(this);
        this.createSkybox = this.createSkybox.bind(this);

        this.id = 'map';
        this.lastBadGuyCreated = Date.now();
        this.enviroment = this.createEnvironment();
        this.skybox = this.createSkybox();
        this.globalLight = this.createGlobalLight();
        this.earthPosition = new THREE.Vector3(-3600, 1500, -3500);

        this.scene.add(this.enviroment);
        this.scene.add(this.skybox);
        this.scene.add(this.globalLight);

        this.startLevel();
    }

    update() {
        if (this.scene.player && this.scene.player.position.distanceTo(this.earthPosition) < 3000) {
            this.showAction('moveToEarth');
        } else {
            this.actionElement.innerHTML = '';
        }
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

    onAction() {
        switch(this.actionElement.getAttribute('action-type')) {
            case 'moveToEarth':
                this.stopLevel();
                this.scene.level = new LevelEarth(this.scene);
        }
    }

    showAction(type) {
        this.actionElement.setAttribute('action-type', type);

        switch(type) {
            case 'moveToEarth':
                this.actionElement.innerHTML = 'Press "Enter" to move on "Earth"';
                break
        }
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
        if (!this.scene.player) {
            return;
        }

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
