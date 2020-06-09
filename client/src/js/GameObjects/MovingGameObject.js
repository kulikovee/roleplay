import AnimatedGameObject from './AnimatedGameObject';

export default class MovingGameObject extends AnimatedGameObject {
    constructor(params = {}) {
        super({
            speed: 0.1,
            throttling: new THREE.Vector3(0.5, 0.95, 0.5),
            acceleration: new THREE.Vector3(),
            mas: 0,
            checkWay: () => true,
            ...params
        });
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);
        const { params: { acceleration, throttling } } = this;

        if (this.params.mas) {
            acceleration.y -= 0.01;

            this.isGrounded = !this.checkWay(0, -0.2, 0);
            this.animationState.isJump = !this.isGrounded;
        }
        
        const hasAccelerationX = Boolean(acceleration.x);
        const hasAccelerationY = Boolean(acceleration.y);
        const hasAccelerationZ = Boolean(acceleration.z);

        const canMoveX = hasAccelerationX && this.checkWay(acceleration.x, 0, 0);
        const canMoveY = hasAccelerationY && this.checkWay(0, acceleration.y, 0);
        const canMoveZ = hasAccelerationZ && this.checkWay(0, 0, acceleration.z);

        if (
           (hasAccelerationX && !canMoveX)
           || (hasAccelerationY && !canMoveY)
           || (hasAccelerationZ && !canMoveZ)
        ) {
            if (!this.params.mas) {
                // Stop object smoothly because of Collider hit
                acceleration.multiplyScalar(0.5);
            }

            if (hasAccelerationX && !canMoveX) {
                const isClimbing = (acceleration.x && acceleration.y <= 0 && this.checkWay(acceleration.x, 0.04, 0));

                if (isClimbing) {
                    acceleration.y = 0.04 / throttling.y;
                } else {
                    acceleration.x = 0;
                }
            }

            if (!canMoveY) { acceleration.y = 0; }

            if (hasAccelerationZ && !canMoveZ) {
                const isClimbing = (acceleration.z && acceleration.y <= 0 && this.checkWay(0, 0.04, acceleration.z));

                if (isClimbing) {
                    acceleration.y = 0.04 / throttling.y;
                } else {
                    acceleration.z = 0;
                }
            }
        }

        acceleration.x *= throttling.x;
        acceleration.y *= throttling.y;
        acceleration.z *= throttling.z;

        const isMoving = (
            Math.abs(acceleration.x) > 0.001
            || Math.abs(acceleration.y) > 0.001
            || Math.abs(acceleration.z) > 0.001
        );

        if (isMoving) {
            // acceleration.multiplyScalar(deltaTime * 60)
            this.position.add(acceleration);
        }
    }

    checkWay(x = 0, y = 0, z = 0) {
        const { position, params: { checkWay } } = this;
        const nextPosition = new THREE.Vector3(position.x + x, position.y + y + 0.1, position.z + z);

        return checkWay(nextPosition, this);
    }

    getLeft() {
        return this.getDirection(new THREE.Vector3(1, 0, 0));
    }

    getUp() {
        return this.getDirection(new THREE.Vector3(0, 1, 0));
    }

    getForward() {
        return this.getDirection(new THREE.Vector3(0, 0, 1));
    }

    /**
     * @param {THREE.Vector3} direction
     */
    getDirection(direction) {
        direction.applyQuaternion(this.object.quaternion);
        return direction;
    }

    getScalarAcceleration() {
        return this.params.acceleration.toArray()
            .map(Math.abs)
            .reduce((r, v) => r + v, 0)
    }
}