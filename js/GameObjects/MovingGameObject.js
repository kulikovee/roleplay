import GameObject from './GameObject.js';

export default class MovingGameObject extends GameObject {
    constructor(object, params = {}) {
        super(object, {
            speed: 0.01,
            throttling: 0.95,
            ...params
        });
        this.acceleration = new THREE.Vector3();

        this.update = this.update.bind(this);
        this.getUp = this.getUp.bind(this);
        this.getLeft = this.getLeft.bind(this);
        this.getForward = this.getForward.bind(this);
        this.getDirection = this.getDirection.bind(this);
    }

    update() {
        GameObject.prototype.update.call(this);
        this.position.add(this.acceleration.multiplyScalar(this.throttling));
    }

    getUp() {
        return this.getDirection(new THREE.Vector3(0, 1, 0));
    }

    getLeft() {
        return this.getDirection(new THREE.Vector3(1, 0, 0));
    }

    getForward() {
        const vector = new THREE.Vector3();
        this.object.getWorldDirection(vector);
        return vector;
    }

    getDirection(direction) {
        const matrix = new THREE.Matrix4();
        matrix.extractRotation(this.object.matrix);
        direction.applyMatrix4(matrix);

        return direction;
    }
}