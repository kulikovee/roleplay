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
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        const { object, target, acceleration, speed } = this.params;

        object.lookAt(target.position);
        // this.fire();

        if (object.position.distanceTo(target.position) > 10) {
            acceleration.add(this.getForward().multiplyScalar(speed));
        }
    }
}