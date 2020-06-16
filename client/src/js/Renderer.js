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
        this.lastRender = 0;

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
    render(time, deltaTime, scene, camera) {
        if (!this.lastRender) {
            this.lastRender = time - deltaTime;
        }

        const timeSinceLastRender = time - this.lastRender;
        const currentFPS = 1000 / timeSinceLastRender;
        this.fps -= (this.fps - currentFPS) / 60;

        if (timeSinceLastRender >= 1000 / this.targetFps) {
            this.renderer.render(scene, camera);
            this.lastRender = time;
        }

        this.targetFps = this.fps + 10;
    }
}
