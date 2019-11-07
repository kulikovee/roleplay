import AbstractLevel from './AbstractLevel.js';
import LevelMap from './LevelMap.js';

export default class LevelEarth extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);

        this.startLevel = this.startLevel.bind(this);
        this.stopLevel = this.stopLevel.bind(this);
        this.onAction = this.onAction.bind(this);
        this.createEnvironment = this.createEnvironment.bind(this);

        this.globalLight = this.createGlobalLight();
        this.enviroment = this.createEnvironment();

        this.scene.add(this.globalLight);
        this.scene.add(this.enviroment);

        this.id = 'mars';
        this.showAction();
        this.startLevel();
    }

    update() {
    }

    createEnvironment() {
        const pivot = new THREE.Object3D();

        this.scene.loadObj({
            baseUrl: './public/assets/mars',
            callback: (object) => {
                object.scale.set(500, 500, 500);
                pivot.add(object);
            }
        });

        return pivot;
    }

    startLevel() {
        this.scene.player.position.set(0, 800, 0)
    }

    stopLevel() {
        this.scene.remove(this.globalLight);
        this.scene.remove(this.enviroment);
        this.scene.player.position.set(3000, 1200, -2900);
        this.scene.player.rotation.set(0, 90, 0);
    }

    onAction() {
        this.stopLevel();
        this.scene.level = new LevelMap(this.scene);
    }

    createGlobalLight() {
        const pivot = new THREE.Object3D();

        const pointLight = new THREE.PointLight(0xffffff);
        pointLight.position.set(100, 1250, 250);
        pivot.add(pointLight);

        var ambientLight = new THREE.AmbientLight(0x303030);
        pivot.add(ambientLight);

        return pivot;
    }

    showAction() {
        this.actionElement.innerHTML = 'Press "Enter" to go back to "Map"';
    }
}
