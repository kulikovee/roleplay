import FiringUnit from './FiringUnit.js';

class AI extends FiringUnit {
    constructor(object, target, params) {
        params = params || {};
        super(
            object,
            {
                ...params,
                speed: params.speed || 0.05,
                fireRate: 500,
                damage: params.damage || 10,
                hp: params.hp || 100,
            }
        );

        this.target = target;
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