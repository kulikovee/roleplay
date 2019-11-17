export default class Camera {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        const ratio = this.getWidth() / this.getHeight();
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);
        this.camera.position.set(5, 3, 15);
        this.deltaY = 10;
        // this.controls = new THREE.OrbitControls(this.camera, this.scene.renderer.renderer.domElement);

        this.toScreenPosition = this.toScreenPosition.bind(this);
        this.update = this.update.bind(this);
        this.getWidth = this.getWidth.bind(this);
        this.getHeight = this.getHeight.bind(this);
        this.addY = this.addY.bind(this);
    }

    update() {
        const { player } = this.scene;

        if (!player) return;

        this.camera.position.set(player.position.x + 5, player.position.y + this.deltaY, player.position.z + 5);
        this.camera.lookAt(player.position);
    }

    addY(y) {
        if (this.deltaY + y > 1 && this.deltaY + y < 15) {
            this.deltaY += y;
        }
    }

    getWidth() {
        const renderer = this.scene.renderer.renderer;
        return renderer.getContext().canvas.width;
    }

    getHeight() {
        const renderer = this.scene.renderer.renderer;
        return renderer.getContext().canvas.height;
    }

    toScreenPosition(obj) {
        const vector = new THREE.Vector3();

        const widthHalf = 0.5 * this.getWidth();
        const heightHalf = 0.5 * this.getHeight();

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(this.camera);

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x,
            y: vector.y
        };

    };
}