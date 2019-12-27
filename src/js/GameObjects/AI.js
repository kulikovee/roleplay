import * as THREE from 'three';
import FiringUnit from './FiringUnit';

export default class AI extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
            damage: 10,
            mas: 1,
            hp: 100,
            fraction: 'enemy',
            fireTimeout: 1.5,
            attackTimeout: 1.5,
            jumpTimeout: 1.5,
            startRunTimeout: 1,
            nextPointUpdateTimeout: 0.1,
            updateTargetTimeout: 0.5,
            ...params,
        });

        const { hp, damage, speed } = this.params;

        this.params.bounty = hp / 4 + damage + speed * 300;
        this.lastRun = 0;
        this.lastTargetUpdate = 0;
        this.lastNextPointUpdate = 0;
        this.lastJumpTimestamp = 0;
        this.isRunning = false;
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        if (this.params.findTarget && this.isUpdateTargetReleased(time)) {
            this.params.target = this.params.findTarget();
        }

        const { object, target, acceleration, speed, getNextPoint, isEnemy } = this.params;

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

        const isAttack = (
            target
            && (!isEnemy || isEnemy(target))
            && isTargetNear
            && target.isAlive()
            && target.getFraction() !== this.getFraction()
        );

        if (isAttack) {
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

        if (isAttack) {
            this.attack();
        }

        this.animationState.isMovingForward = this.isRunning && this.isAcceleration();

        if (this.isRunning) {
            this.lastRun = time;
            acceleration.add(this.getForward().multiplyScalar(speed));

            const isJump = (
                this.params.isGrounded
                && (acceleration.x || acceleration.z)
                && time - this.lastJumpTimestamp > this.params.jumpTimeout * 1000
                && !this.checkWayForJump(0.1)
                && this.checkWayForJump(1.5)
            );

            if (isJump) {
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

        this.animationState.isRotateLeft = rotationToTargetRadians - object.rotation.y > 0.1;
        this.animationState.isRotateRight = rotationToTargetRadians - object.rotation.y < -0.1;

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

    checkWayForJump(jumpHeight) {
        const { params: { acceleration: { x: dx, y: dy, z: dz } } } = this;
        return this.checkWay(dx, dy + jumpHeight, dz);
    }
}