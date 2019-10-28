import Unit from './Unit.js';

export default class FiringUnit extends Unit {
    constructor(params = {}) {
        super({
            fireRate: 40,
            fireFlySpeed: 3,
            ...params
        });

        this.latestFire = Date.now();
        this.fire = this.fire.bind(this);
    }

    fire() {
        if (this.params.fire && (Date.now() - this.latestFire >= this.params.fireRate)) {
            this.latestFire = Date.now();
            this.params.fire();
        }
    }
}