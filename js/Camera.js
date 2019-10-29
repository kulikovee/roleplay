export default class Camera {
    constructor(scene) {
        this.scene = scene;
        const ratio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);
        this.camera.position.set(5, 3, 15);

        this.toScreenPosition = this.toScreenPosition.bind(this);
        this.update = this.update.bind(this);
    }

    update() {
        if (!this.player) return;

        const cameraPosition = this.player.position.clone();

        cameraPosition.sub(
            this.player.getDirection(
                new THREE.Vector3(0, 0, window.innerHeight / 20)
            )
        );

        cameraPosition.y += 3;
        let distance = this.camera.position.distanceTo(cameraPosition);

        if (distance < 1) {
            distance = 1;
        }

        const speed = (25 / distance + 1) || 1;

        if (this.camera && this.camera.position && cameraPosition) {
            this.camera.position.sub(
                this.camera.position
                    .clone()
                    .sub(cameraPosition)
                    .multiplyScalar(1 / speed)
            );
        }

        this.camera.lookAt(this.player.object.position);
    }

    toScreenPosition(obj) {
        const renderer = this.scene.renderer.renderer;
        const vector = new THREE.Vector3();

        const widthHalf = 0.5 * renderer.getContext().canvas.width;
        const heightHalf = 0.5 * renderer.getContext().canvas.height;

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