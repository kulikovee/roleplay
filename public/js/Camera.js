export default class Camera {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        const ratio = this.getWidth() / this.getHeight();
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);
        this.camera.position.set(5, 3, 15);
        this.deltaY = 5;

        this.toScreenPosition = this.toScreenPosition.bind(this);
        this.update = this.update.bind(this);
        this.getWidth = this.getWidth.bind(this);
        this.getHeight = this.getHeight.bind(this);
        this.addY = this.addY.bind(this);
    }

    update() {
        const { scene: { player, input: { isThirdPerson } } } = this;

        if (!player) return;

        const distanceToPlayer = new THREE.Vector3(0, this.deltaY, 0);

        this.camera.position.copy(
            player.position.clone().add(
                distanceToPlayer.add(
                    isThirdPerson
                        ? player.getForward().multiplyScalar(-10)
                        : new THREE.Vector3(7.5, 0, 0)
                )
            )
        );

        this.camera.lookAt(player.position);
    }

    addY(y) {
        if (this.deltaY + y > 1 && this.deltaY + y < 25) {
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