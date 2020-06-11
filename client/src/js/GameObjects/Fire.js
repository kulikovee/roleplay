import Unit from './Unit';
import MovingGameObject from './MovingGameObject';

export default class Fire extends MovingGameObject {
    constructor(params = {}) {
        super({
            gravity: 0.05,
            slideThrottling: new THREE.Vector3(0.5, 0.5, 0.5),
            throttling: new THREE.Vector3(1, 1, 1),
            ...params,
        });

        this.params.acceleration.add(
            this.getForward().multiplyScalar(this.params.speed * 0.1)
        );
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.params.getCollisions) {
            const collisions = this.params.getCollisions(this);

            collisions
                .filter((collisionGameObject) => (
                    collisionGameObject instanceof Unit
                    && collisionGameObject.isEnemy(this.params.parent)
                ))
                .forEach(collisionGameObject => (
                    collisionGameObject.damageTaken({
                        damage: this.params.damage,
                        unit: this.params.parent,
                    }, time)
                ));

            if (collisions.length && this.params.destroy) {
                this.params.destroy(this);
            }
        }
    }
}