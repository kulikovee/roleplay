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
        ambientLight.castShadow = false;
        pivot.add(ambientLight);


        const light = new THREE.DirectionalLight(0xffffff, 1, 100);
        light.position.set(25, 50, 25);
        light.shadow.bias = -0.000018;
        const shadowSize = 45;
        light.castShadow = true;
        light.shadow.camera.left = -shadowSize;
        light.shadow.camera.right = shadowSize;
        light.shadow.camera.top = shadowSize;
        light.shadow.camera.bottom = -shadowSize;
        light.shadow.mapSize.width = 8192;
        light.shadow.mapSize.height = 8192;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 1000;
        light.shadow.camera.visible = true;

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