import Unit from './Unit.js';

class FiringUnit extends Unit {
    constructor(object, params) {
        params = params || {};
        super(object, params);

        this.fireRate = params.fireRate || 40;
        this.fireFlySpeed = params.fireFlySpeed || 3;
        this.latestFire = Date.now();

        this.fire = this.fire.bind(this);
    }

    fire() {
        if (Date.now() - this.latestFire >= this.fireRate) {
            this.latestFire = Date.now();
        } else {
            return false;
        }

        this.gameLogicService.fire(this);
    }
}