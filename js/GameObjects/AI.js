import FiringUnit from './FiringUnit.js';

export default class AI extends FiringUnit {
    constructor(object, params = {}) {
        super(object, {
            speed: 0.05,
            damage: 10,
            hp: 100,
            fireRate: 500,
            ...params,
        });

        this.bounty = this.hp / 4 + this.damage + this.speed * 300;
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);
        this.object.lookAt(this.target.position);
        this.fire();
        if (this.object.position.distanceTo(this.target.position) > 50) {
            this.acceleration.add(this.getForward().multiplyScalar(this.speed));
        }
    }
}