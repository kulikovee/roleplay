export default class Renderer {
    constructor(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xccccff);
        container.appendChild(this.renderer.domElement);

        this.setSize = this.setSize.bind(this);
        this.render = this.render.bind(this);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
}
