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
        this.startLevel = this.startLevel.bind(this);
        this.onAction = this.onAction.bind(this);

        this.globalLight = this.createGlobalLight();
        this.scene.add(this.globalLight);

        this.id = 'earth';
        this.showAction();
    }

    update() {
    }

    stopLevel() {
        this.scene.remove(this.globalLight);
    }

    startLevel() {
        this.scene.ui.restartGame();
    }

    onAction() {
        console.log('onAction Earth');
        this.stopLevel();
        this.scene.level = new LevelMap(this.scene);
    }

    showAction() {
        this.actionElement.innerHTML = 'Press "Enter" to move back on "Map"';
    }
}
