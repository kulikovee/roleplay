import FiringUnit from './FiringUnit';

export default class AI extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
            damage: 10,
            mas: 1,
            hp: 100,
            fireRate: 1.5,
            attackRate: 1.5,
            ...params,
        });

        const { hp, damage, speed } = this.params;

        this.params.bounty = hp / 4 + damage + speed * 300;
        this.lastRun = 0;
        this.lastRunTimeout = 1000;
        this.isRunning = false;
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        const { object, target, acceleration, speed } = this.params;

        const rotationToTargetRadians = Math.atan2(
            target.position.x - object.position.x,
            target.position.z - object.position.z
        );

        this.animationState.isRotateLeft = rotationToTargetRadians > object.rotation.y;
        this.animationState.isRotateRight = rotationToTargetRadians < object.rotation.y;

        object.rotation.set(0, rotationToTargetRadians, 0);

        // this.fire();

        const isTargetNear = object.position.distanceTo(target.position) < 1.75;

        this.isRunning = (
            !isTargetNear
            && (this.isRunning || this.isRunReleased(time))
            && this.isAttackReleased(time)
            && this.isHitReleased(time)
        );

        if (isTargetNear && target.isAlive()) {
            this.attack();
        }

        this.animationState.isMovingForward = this.isRunning;

        if (this.isRunning) {
            this.lastRun = time;
            acceleration.add(this.getForward().multiplyScalar(speed));
        }
    }

    isRunReleased(time) {
        return time - this.lastRun > this.lastRunTimeout;
    }
}