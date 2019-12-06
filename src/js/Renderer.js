import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';

export default class Renderer extends AutoBindMethods {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        super();
        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.setClearColor(0xffffff);
        this.renderer.autoClear = false;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.fps = 60;
        this.targetFps = 70;
        this.lastRender = Date.now();
        container.appendChild(this.renderer.domElement);
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
    render(scene, camera) {
        const now = Date.now();
        const deltaTime = now - this.lastRender;

        this.fps -= (this.fps - 1000 / deltaTime) / 60;

        if (deltaTime >= 1000 / this.targetFps) {
            this.lastRender = now;
            this.renderer.render(scene, camera);
        }

        if (this.fps < 35) {
            this.targetFps = 35;
        } else if (this.fps < 45) {
            this.targetFps = 45;
        } else if (this.fps < 55) {
            this.targetFps = 55;
        }
    }
}
