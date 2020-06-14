import AutoBindMethods from './AutoBindMethods';

export default class Renderer extends AutoBindMethods {
    /**
     * @param {HTMLElement} container
     */
    constructor(container = null, params = {}) {
        super();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
            alpha: true,
            powerPreference: 'high-performance',
            ...params,
        });

        this.fps = 60;
        this.targetFps = 70;

        if (container) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setClearColor(0xffffff, 0);
            this.renderer.autoClear = false;
            this.renderer.gammaOutput = true;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            // this.renderer.shadowMap.type = THREE.BasicShadowMap;

            container.appendChild(this.renderer.domElement);
        }
    }

    /**
     * @param {number|string} width
     * @param {number|string} height
     */
    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     */
    render(scene, camera, deltaTime) {
        this.fps -= (this.fps - 1000 / deltaTime) / 60;

        if (deltaTime >= 1000 / this.targetFps) {
            this.renderer.render(scene, camera);
        }

        this.targetFps = this.fps + 10;
    }
}
