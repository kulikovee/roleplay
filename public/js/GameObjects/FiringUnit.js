import Unit from './Unit.js';

export default class FiringUnit extends Unit {
    constructor(params = {}) {
        super({
            fireRate: 1.5,
            fireFlySpeed: 0.3,
            ...params
        });

        this.shouldFire = false;
        this.latestFire = Date.now();

        this.update = this.update.bind(this);
        this.fire = this.fire.bind(this);
        this.isFireReleased = this.isFireReleased.bind(this);
        this.getFireInitialPosition = this.getFireInitialPosition.bind(this);
    }

    getFireInitialPosition() {
        return this.position.clone().add(
            this.getUp()
                .multiplyScalar(1.5)
                .add(this.getForward().multiplyScalar(0.3))
        );
    }

    update() {
        Unit.prototype.update.call(this);

        if (this.isDead()) {
            return;
        }

        this.isFire = false;

        if (this.shouldFire && this.params.fire && this.isFireReleased()) {
            this.isFire = true;
            this.shouldFire = false;
            this.latestFire = Date.now();
            this.params.fire();
        } else {
            this.shouldFire = false;
        }
    }

    isFireReleased() {
        return Date.now() - this.latestFire >= this.params.fireRate * 1000;
    }

    fire() {
        this.shouldFire = true;
    }
}