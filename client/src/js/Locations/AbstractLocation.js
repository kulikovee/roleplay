import AutoBindMethods from '../AutoBindMethods';

export default class AbstractLocation extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene, id = 'unknown-level') {
        super();
        this.scene = scene;
        this.id = id;
    }

    update() {}

    startLocation() {}
    restartLocation() {}
    stopLocation() {}
    onAction() {}

    getLocationName() {
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
        light.shadow.camera.far = 250;
        light.shadow.camera.visible = true;

        return light;
    }


    createSkybox(skyboxName) {
        const materialArray = [
            'skyboxRT',
            'skyboxLF',
            'skyboxUP',
            'skyboxDN',
            'skyboxFT',
            'skyboxBK',
        ].map(filename => `./assets/textures/${skyboxName}/${filename}.jpg`);

        return new THREE.CubeTextureLoader().load(materialArray);
    }
}