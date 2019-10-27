import Unit from './Unit.js';

export default class FiringUnit extends Unit {
    constructor(object, params = {}) {
        super(object, {
            fireRate: 40,
            fireFlySpeed: 3,
            ...params
        });

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