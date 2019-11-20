import FiringUnit from './FiringUnit.js';

export default class AI extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
            damage: 10,
            hp: 100,
            fireRate: 500,
            ...params,
        });

        const { hp, damage, speed } = this.params;

        this.params.bounty = hp / 4 + damage + speed * 300;
        this.lastRun = Date.now();
        this.lastRunTimeout = 1000;
        this.isRunning = false;

        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        const { object, target, acceleration, speed } = this.params;

        const rotationToTargetRadians = Math.atan2(
            target.position.x - object.position.x,
            target.position.z - object.position.z
        );

        this.animationState.isRotateLeft = rotationToTargetRadians > object.rotation.y;
        this.animationState.isRotateRight = rotationToTargetRadians < object.rotation.y;

        object.rotation.set(0, rotationToTargetRadians, 0);

        // this.fire();

        if (object.position.distanceTo(target.position) > 10) {
            if (Date.now() - this.lastRun > this.lastRunTimeout) {
                this.isRunning = true;
            }
        } else {
            this.isRunning = false;
        }

        if (this.isRunning) {
            this.lastRun = Date.now();
            acceleration.add(this.getForward().multiplyScalar(speed));
        }
    }
}