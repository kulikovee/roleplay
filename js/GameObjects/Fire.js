import MovingGameObject from './MovingGameObject.js';

export default class Fire extends MovingGameObject {
    constructor(object, params = {}) {
        super(object, params);

        this.acceleration.add(
            this.getForward().multiplyScalar(this.speed)
        );
    }
}