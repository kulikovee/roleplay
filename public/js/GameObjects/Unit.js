import MovingGameObject from './MovingGameObject.js';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            damage: 10,
            ...params,
        });

        ['onDamageTaken', 'onDamageDeal', 'onKill', 'onDie'].forEach((eventName) => {
            if (typeof params[eventName] === 'function') {
                this.addEventListener(eventName, params[eventName]);
            }
        });

        this.damageTaken = this.damageTaken.bind(this);
    }

    /**
     * @param {Fire} fire
     */
    damageTaken(fire) {
        if (fire) {
            this.params.hp -= fire.params.damage;
            const fireParent = fire.params.parent;

            this.dispatchEvent('onDamageTaken', fireParent);

            if (fireParent) {
                fireParent.dispatchEvent('onDamageDeal', this);
            }

            if (this.params.hp <= 0) {
                this.dispatchEvent('onDie', fireParent);

                if (fireParent) {
                    fireParent.dispatchEvent('onKill', this);
                }

                if (typeof this.params.destroy === 'function') {
                    this.params.destroy();
                }
            }
        }
    }
}