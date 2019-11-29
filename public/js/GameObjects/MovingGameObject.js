import AnimatedGameObject from './AnimatedGameObject.js';

export default class MovingGameObject extends AnimatedGameObject {
    constructor(params = {}) {
        super({
            speed: 0.01,
            throttling: new THREE.Vector3(0.5, 0.95, 0.5),
            acceleration: new THREE.Vector3(),
            mas: 0,
            isGrounded: false,
            checkWay: () => true,
            ...params
        });
    }

    update() {
        AnimatedGameObject.prototype.update.call(this);
        const { params: { acceleration, throttling } } = this;

        if (this.params.mas) {
            acceleration.y -= 0.01;

            this.params.isGrounded = acceleration.y <= 0 && !this.checkWay(0, -0.1, 0);
            this.animationState.isJump = !this.params.isGrounded;
        }

        const isX = acceleration.x && this.checkWay(acceleration.x, 0, 0);
        const isY = acceleration.y && this.checkWay(0, acceleration.y, 0);
        const isZ = acceleration.z && this.checkWay(0, 0, acceleration.z);

        if (!isX || !isY || !isZ) {
            if (!this.params.mas) { acceleration.multiplyScalar(0.75); }
            if (!isX) { acceleration.x = 0; }
            if (!isY) { acceleration.y = 0; }
            if (!isZ) { acceleration.z = 0; }
        }

        acceleration.x *= throttling.x;
        acceleration.y *= throttling.y;
        acceleration.z *= throttling.z;

        this.position.add(acceleration);
    }

    checkWay(x = 0, y = 0, z = 0) {
        return this.params.checkWay(new THREE.Vector3(this.position.x + x, this.position.y + y, this.position.z + z));
    }

    getLeft() {
        return this.getDirection(new THREE.Vector3(1, 0, 0));
    }

    getUp() {
        return this.getDirection(new THREE.Vector3(0, 1, 0));
    }

    getForward() {
        const vector = new THREE.Vector3();
        this.params.object.getWorldDirection(vector);
        return vector;
    }

    /**
     * @param {THREE.Vector3} direction
     */
    getDirection(direction) {
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.params.object.matrix);
        direction.applyMatrix4(matrix);

        return direction;
    }

    getScalarAcceleration() {
        return this.params.acceleration.toArray()
            .map(Math.abs)
            .reduce((r, v) => r + v, 0)
    }
}