import MovingGameObject from './MovingGameObject';

export default class Fire extends MovingGameObject {
    constructor(params = {}) {
        super(params);

        this.params.acceleration.add(
            this.getForward().multiplyScalar(this.params.speed)
        );
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.params.getCollisions) {
            const collisions = this.params.getCollisions(this);

            collisions.forEach(collisionGameObject => collisionGameObject.damageTaken({
                damage: this.params.damage,
                unit: this.params.parent,
            }, time));

            if (collisions.length && this.params.destroy) {
                this.params.destroy(this);
            }
        }
    }
}