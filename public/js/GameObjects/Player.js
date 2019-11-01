import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 1,
            fireRate: 100,
            damage: 50,
            hp: 100,
            score: 0,
            ...params,
        });

        this.params.kills = 0;
        this.params.isFire = false;
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        const { input, object, acceleration, speed } = this.params;

        if (input.mouseLeft) {
            this.fire();
        }

        if (input.look.horizontal) {
            object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -input.look.horizontal / 5000
            );
        }

        object.rotateX(input.look.vertical / 2500);
        acceleration.add(this.getMovingDirection().multiplyScalar(speed));
    }

    getMovingDirection() {
        return this.getDirection(
            new THREE.Vector3(-this.params.input.horizontal, this.params.input.space, this.params.input.vertical)
        );
    }
}