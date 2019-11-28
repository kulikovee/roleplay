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
        pointLight.position.set(250, 250, 250);
        pivot.add(pointLight);

        var ambientLight = new THREE.AmbientLight(0x303030);
        pivot.add(ambientLight);

        return pivot;
    }


    createSkybox() {
        const materialArray = ['xpos', 'xneg', 'ypos', 'yneg', 'zpos', 'zneg'].map(function (direction) {
            const url = `./public/assets/textures/sky-nebula/nebula-${direction}.png`;
            return new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(url),
                side: THREE.BackSide,
                fog: false
            });
        });

        const skyGeometry = new THREE.CubeGeometry(75000, 75000, 75000);
        const skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        return new THREE.Mesh(skyGeometry, skyMaterial);
    }
}