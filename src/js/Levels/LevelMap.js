import * as THREE from 'three';
import AbstractLevel from './AbstractLevel';
import { AI } from '../GameObjects';

export default class LevelMap extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);

        this.id = 'map';
        this.lastBadGuyCreated = Date.now();
        this.environment = this.createEnvironment();
        this.skybox = this.createSkybox();
        this.globalLight = this.createGlobalLight();

        this.scene.add(this.environment);
        this.scene.add(this.skybox);
        this.scene.add(this.globalLight);

        this.createLevelColliders();
        this.startLevel();
    }

    startLevel() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = this.scene.intervals.setInterval(this.createBadGuyByTimeout, 500);
        this.scene.ui.startGame();
        this.scene.ui.setPause(true);
    }

    restartLevel() {
        this.scene.clearScene();
    }

    stopLevel() {
        this.scene.remove(this.environment);
        this.scene.remove(this.skybox);
        this.scene.remove(this.globalLight);
        this.scene.gameObjectsService.removeAllExceptPlayer();
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    createLevelColliders() {
        this.scene.colliders.addColliderFunction((position, gameObject) => {
            const { x, y, z } = position;

            if (
                (y < 0.1 && Math.abs(x) < 50 && Math.abs(z) < 50) // flat
                || (Math.abs(z) < 5 && x > -39 && x < -28 && y < 1.2) // table
                || (Math.abs(z) < 0.8 && x > -41 && x < -40 && y < 0.7) // chair
                || (Math.abs(z) > 0.8 && Math.abs(z) < 1.6 && x > -41 && x < -39 && y < 2) // chair
                || (Math.abs(z) < 1.6 && x > -43 && x < -41 && y < 2) // chair
            ) {
                return true;
            }

            const badGuys = this.getBadGuys();

            for(let badGuy of badGuys) {
                if (badGuy !== gameObject && badGuy.position.distanceTo(position) < 1) {
                    return true;
                }
            }

            return false;
        });
    }

    createEnvironment() {
        const pivot = new THREE.Object3D();
        pivot.name = 'Level Environment';
        const treePositions = [{ x: 0, z: 15 }, { x: 0, z: -15 }, { x: 15, z: 0 }, { x: -15, z: 0 }];

        this.scene.loadGLTF({
            baseUrl: './assets/models/environment/hall/hall',
            noScene: true,
            callback: object => pivot.add(object.scene)
        });

        this.scene.loadGLTF({
            baseUrl: './assets/models/environment/tree',
            noScene: true,
            callback: (loadedModel) => treePositions.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'Tree';
                model.position.set(position.x, 0, position.z);
                const { x, z } = model.position;

                this.scene.colliders.addColliderFunction(
                    (position) => Math.abs(position.x - x) < 2 && Math.abs(position.z - z) < 2
                );

                pivot.add(model);
            })
        });

        return pivot;
    }

    createSkybox() {
        const materialArray = ['RT', 'LF', 'UP', 'DN', 'FT', 'BK'].map(function (direction) {
            const url = `./assets/textures/sky/skybox${direction}.jpg`;
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

    getBadGuys() {
        return this.scene.units.getAliveUnits().filter(unit => unit instanceof AI);
    }

    createBadGuyByTimeout() {
        const { ui: { pause }, gameObjectsService: { gameObjects } } = this.scene;
        const player = this.scene.getPlayer();

        if (!player || pause) {
            return;
        }

        const level = player.getLevel(),
            badGuyTimeout = 5000 - level * 500,
            isBadGuyReleased = Date.now() - this.lastBadGuyCreated >= badGuyTimeout,
            badGuysCount = this.getBadGuys().length;

        if (badGuysCount < level && isBadGuyReleased) {
            this.lastBadGuyCreated = Date.now();
            this.scene.units.createAI();
        }
    }
}
