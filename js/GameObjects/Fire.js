import MovingGameObject from './MovingGameObject.js';

class Fire extends MovingGameObject {
    constructor(object, speed, damage, parent) {
        super(object, speed, 1);
        this.parent = parent;
        this.damage = damage;

        this.acceleration.add(
            this.getForward().multiplyScalar(this.speed)
        );
    }
}