import GameObject from './GameObject.js';

export default class MovingGameObject extends GameObject {
    constructor(params = {}) {
        super({
            speed: 0.01,
            throttling: 0.95,
            acceleration: new THREE.Vector3(),
            ...params
        });

        this.update = this.update.bind(this);
        this.getUp = this.getUp.bind(this);
        this.getLeft = this.getLeft.bind(this);
        this.getForward = this.getForward.bind(this);
        this.getDirection = this.getDirection.bind(this);
    }

    update() {
        GameObject.prototype.update.call(this);
        const { acceleration, throttling } = this.params;
        this.position.add(acceleration.multiplyScalar(throttling));
    }

    getUp() {
        return this.getDirection(new THREE.Vector3(0, 1, 0));
    }

    getLeft() {
        return this.getDirection(new THREE.Vector3(1, 0, 0));
    }

    getForward() {
        const vector = new THREE.Vector3();
        this.params.object.getWorldDirection(vector);
        return vector;
    }

    getDirection(direction) {
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.params.object.matrix);
        direction.applyMatrix4(matrix);

        return direction;
    }
}