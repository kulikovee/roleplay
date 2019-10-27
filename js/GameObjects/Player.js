import FiringUnit from './FiringUnit.js';

class Player extends FiringUnit {
    constructor(object, input, params) {
        params = params || {};

        super(
            object,
            {
                ...params,
                speed: params.speed || 0.9,
                fireRate: 100,
                damage: params.damage || 50,
                hp: params.hp || 100
            }
        );

        this.input = input;
        this.kills = 0;
        this.score = params.score || 0;
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