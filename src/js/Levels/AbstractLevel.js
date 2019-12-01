import * as THREE from 'three';
import AutoBindMethods from '../AutoBindMethods';

export default class AbstractLevel extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super();
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

        var ambientLight = new THREE.AmbientLight(0x888888);
        pivot.add(ambientLight);

        const shadowSize = 50;

        const light = new THREE.DirectionalLight(0xffffff, 1.75);
        light.position.set(50, 100, 50);

        light.castShadow = true;

        // TODO: Check why there is glitches and artifacts with default bias
        light.shadow.bias = -0.00005;
        light.shadow.camera.left = -shadowSize;
        light.shadow.camera.right = shadowSize;
        light.shadow.camera.top = shadowSize;
        light.shadow.camera.bottom = -shadowSize;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.far = 1000;
        light.shadow.darkness = 1;

        pivot.add(light);

        return pivot;
    }


    createSkybox() {
        const materialArray = ['xpos', 'xneg', 'ypos', 'yneg', 'zpos', 'zneg'].map(function (direction) {
            const url = `./assets/textures/sky-nebula/nebula-${direction}.png`;
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