import Unit from './Unit';

export default class FiringUnit extends Unit {
    constructor(params = {}) {
        super({
            fireTimeout: 1.5,
            fireFlySpeed: 0.3,
            ...params
        });

        this.shouldFire = false;
        this.latestFire = 0;
    }

    getFireInitialPosition() {
        return this.position.clone().add(
            this.getUp()
                .multiplyScalar(1.5)
                .add(this.getForward().multiplyScalar(0.3))
        );
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        this.isFire = false;

        if (this.shouldFire && this.params.fire && this.isFireReleased(time)) {
            this.isFire = true;
            this.shouldFire = false;
            this.latestFire = time;
            this.params.fire();
        } else {
            this.shouldFire = false;
        }
    }

    isFireReleased(time) {
        return time - this.latestFire >= this.params.fireTimeout * 1000;
    }

    fire() {
        this.shouldFire = true;
    }
}