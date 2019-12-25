import * as THREE from 'three';
import AutoBindMethods from '../AutoBindMethods';

export default class AbstractLevel extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene, id = 'unknown-level') {
        super();
        this.scene = scene;
        this.id = id;
    }

    update() {}

    startLevel() {}
    restartLevel() {}
    stopLevel() {}
    onAction() {}

    getLevelId() {
        return this.id;
    }

    createAmbientLight() {
        const ambientLight = new THREE.AmbientLight(0x888888);
        ambientLight.castShadow = false;
        return ambientLight;
    }

    createShadowLight() {
        const light = new THREE.DirectionalLight(0xffffff, 10, 150);
        light.intensity = 1;
        light.shadow.bias = -0.00001;
        const shadowSize = 25;
        light.castShadow = true;
        light.shadow.camera.left = -shadowSize;
        light.shadow.camera.right = shadowSize;
        light.shadow.camera.top = shadowSize;
        light.shadow.camera.bottom = -shadowSize;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 10;
        light.shadow.camera.far = 150;
        light.shadow.camera.visible = true;

        return light;
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