import AnimatedGameObject from './AnimatedGameObject.js';

export default class MovingGameObject extends AnimatedGameObject {
    constructor(params = {}) {
        super({
            speed: 0.01,
            throttling: new THREE.Vector3(0.5, 0.95, 0.5),
            acceleration: new THREE.Vector3(),
            mas: 0,
            ...params
        });

        this.update = this.update.bind(this);
        this.getUp = this.getUp.bind(this);
        this.getLeft = this.getLeft.bind(this);
        this.getForward = this.getForward.bind(this);
        this.getDirection = this.getDirection.bind(this);
        this.getScalarAcceleration = this.getScalarAcceleration.bind(this);
    }

    update() {
        AnimatedGameObject.prototype.update.call(this);
        const { acceleration, throttling } = this.params;

        if (this.params.mas) {
            if (this.position.y > 0) {
                acceleration.y -= 0.01;
            } else if (acceleration.y < 0) {
                acceleration.y = 0;
                this.position.y = 0;
            }
        }

        acceleration.x *= throttling.x;
        acceleration.y *= throttling.y;
        acceleration.z *= throttling.z;

        this.position.add(acceleration);
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