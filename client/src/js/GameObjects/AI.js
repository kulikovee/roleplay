import FiringUnit from './FiringUnit';

export default class AI extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.5,
            damage: 10,
            hp: 100,
            name: 'Unnamed Unit',
            fraction: 'neutral',
            fireTimeout: 1.5,
            attackTimeout: 1.5,
            jumpTimeout: 1.5,
            startRunTimeout: 1,
            nextPointUpdateTimeout: 0.1,
            updateTargetTimeout: 3,
            type: 'ai',
            ...params,
        });

        const { hp, damage, speed } = this.params;

        this.params.bounty = hp / 4 + damage + speed * 30;
        this.lastRun = 0;
        this.lastTargetUpdate = 0;
        this.lastNextPointUpdate = 0;
        this.lastJumpTimestamp = 0;
        this.isRunning = false;
        this.isAttack = false;
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        const { object, target, acceleration, speed, getNextPoint, fromNetwork } = this.params;

        if (!fromNetwork) {
            if (this.params.findTarget && this.isUpdateTargetReleased(time)) {
                this.params.target = this.params.findTarget();
            }

            if (target) {
                if (getNextPoint) {
                    if (this.isNextPointUpdateReleased(time)) {
                        this.lastNextPointUpdate = time;
                        this.nextPoint = getNextPoint(this.position, target.position);
                    }
                } else {
                    this.nextPoint = target.position;
                }
            }

            const isTargetNear = target && object.position.distanceTo(target.position) < 1.75;

            this.isAttack = (
               isTargetNear
               && this.isEnemy(target)
               && target.isAlive()
            );

            if (this.isAttack) {
                this.rotateToPosition(target.position);
            } else if (this.nextPoint) {
                this.rotateToPosition(this.nextPoint);
            }

            const isNextPointNear = !this.nextPoint;

            this.isRunning = (
                target
                && !isTargetNear
                && !isNextPointNear
                && (this.isRunning || this.isRunReleased(time))
                && this.isAttackReleased(time)
                && this.isHitReleased(time)
            );
        }

        if (this.isAttack) {
            this.attack();
        }

        this.animationState.isMovingForward = this.isRunning && (fromNetwork || this.isAcceleration());

        if (!fromNetwork && this.isRunning) {
            const checkWay = (jumpHeight) => {
                const { params: { acceleration: { x: dx, y: dy, z: dz } } } = this;
                return this.checkWay(dx, dy + jumpHeight, dz);
            };

            this.lastRun = time;
            acceleration.add(this.getForward().multiplyScalar((speed * 0.1) * (deltaTime * 0.06)));

            const isJumpNeeded = (
                this.isGrounded
                && (acceleration.x || acceleration.z)
                && time - this.lastJumpTimestamp > this.params.jumpTimeout * 1000
                && !checkWay(0.1)
                && checkWay(1.5)
            );

            if (isJumpNeeded) {
                this.lastJumpTimestamp = time;
                acceleration.y += 0.25;
            }
        }
    }

    rotateToPosition(position) {
        const { object } = this.params;

        const rotationToTargetRadians = Math.atan2(
            position.x - object.position.x,
            position.z - object.position.z
        );

        // this.animationState.isRotateLeft = rotationToTargetRadians - object.rotation.y > 0.1;
        // this.animationState.isRotateRight = rotationToTargetRadians - object.rotation.y < -0.1;

        const targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromEuler(object.rotation.clone().set(0, rotationToTargetRadians, 0));
        object.quaternion.slerp(targetQuaternion, 0.1);
    }

    isAcceleration() {
        return (
            Math.abs(this.params.acceleration.x)
            + Math.abs(this.params.acceleration.y)
            + Math.abs(this.params.acceleration.z)
        ) > 0.01;
    }

    isRunReleased(time) {
        return time - this.lastRun > this.params.startRunTimeout * 1000;
    }

    isNextPointUpdateReleased(time) {
        return time - this.lastNextPointUpdate > this.params.nextPointUpdateTimeout * 1000;
    }

    isUpdateTargetReleased(time) {
        return time - this.lastTargetUpdate > this.params.updateTargetTimeout * 1000;
    }

    damageTaken({ damage, unit: attacker } = {}, time) {
        super.damageTaken({ damage, unit: attacker }, time);

        if (!this.params.target) {
            this.params.target = attacker;
            this.lastTargetUpdate = time;
        }
    }
}