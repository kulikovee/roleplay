import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(object, params = {}) {
        super(object, {
            speed: 0.9,
            fireRate: 100,
            damage: 50,
            hp: 100,
            score: 0,
            ...params,
        });

        this.kills = 0;
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        if (this.input.mouseLeft) {
            this.fire();
        }

        if (this.input.look.horizontal) {
            this.object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -this.input.look.horizontal / 1000
            );
        }

        this.object.rotateX(this.input.look.vertical / 500);
        this.acceleration.add(
            this.getMovingDirection().multiplyScalar(this.speed)
        );
    }

    getMovingDirection() {
        return this.getDirection(
            new THREE.Vector3(-this.input.horizontal, this.input.space, this.input.vertical)
        );
    }
}