export default class AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.getLevelId = this.getLevelId.bind(this);
        this.scene = scene;
        this.id = 'unknown-level';
        this.actionElement = document.getElementById('action');
    }

    update() {}
    startLevel() {}
    restartLevel() {}
    stopLevel() {}
    onAction() {}

    getLevelId() {
        return this.id;
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
}