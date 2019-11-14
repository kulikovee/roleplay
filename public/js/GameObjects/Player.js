import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
            fireRate: 30,
            damage: 50,
            hp: 100,
            experience: 0,
            score: 500,
            isFire: false,
            ...params,
        });

        this.update = this.update.bind(this);
        this.getExperience = this.getExperience.bind(this);
        this.getLevel = this.getLevel.bind(this);
        this.getMovingDirection = this.getMovingDirection.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        const { input, object, acceleration, speed } = this.params;


        if (input.attack1) {
            this.attack();
        }

        if (input.attack2) {
            this.fire();
        }

        if (input.look.horizontal) {
            object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -input.look.horizontal / 5000
            );
        }

        acceleration.add(this.getMovingDirection().multiplyScalar(speed));
    }

    getExperience() {
        return this.params.experience;
    }

    getLevel() {
        return Math.floor(Math.sqrt(this.params.experience / 100)) + 1;
    }

    getMovingDirection() {
        return this.getDirection(
            new THREE.Vector3(-this.params.input.horizontal, this.params.input.space, this.params.input.vertical)
        );
    }
}