import MovingGameObject from './MovingGameObject';

export default class Fire extends MovingGameObject {
    constructor(params = {}) {
        super(params);

        this.params.acceleration.add(
            this.getForward().multiplyScalar(this.params.speed)
        );
    }

    update(deltaTime) {
        MovingGameObject.prototype.update.call(this, deltaTime);

        if (this.params.getCollisions) {
            const collisions = this.params.getCollisions(this);

            collisions.forEach(collisionGameObject => collisionGameObject.damageTaken(this));

            if (collisions.length && this.params.destroy) {
                this.params.destroy(this);
            }
        }
    }
}