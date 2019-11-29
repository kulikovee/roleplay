import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';

export default class Renderer extends AutoBindMethods {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        super();
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xccccff);
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
        this.renderer.render(scene, camera);
    }
}
