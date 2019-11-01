import Unit from './Unit.js';

export default class FiringUnit extends Unit {
    constructor(params = {}) {
        super({
            fireRate: 40,
            fireFlySpeed: 3,
            ...params
        });

        this.shouldFire = false;
        this.latestFire = Date.now();

        this.fire = this.fire.bind(this);
        this.update = this.update.bind(this);
    }

    update() {
        Unit.prototype.update.call(this);
        this.isFire = false;

        if (this.shouldFire && this.params.fire && (Date.now() - this.latestFire >= this.params.fireRate)) {
            this.isFire = true;
            this.shouldFire = false;
            this.latestFire = Date.now();
            this.params.fire();
        }
    }

    fire() {
        this.shouldFire = true;
    }
}