import MovingGameObject from './MovingGameObject.js';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            damage: 10,
            attackRate: 240,
            ...params,
        });

        this.shouldAttack = false;
        this.latestAttack = Date.now();

        ['onDamageTaken', 'onDamageDeal', 'onKill', 'onDie'].forEach((eventName) => {
            if (typeof params[eventName] === 'function') {
                this.addEventListener(eventName, params[eventName]);
            }
        });

        this.update = this.update.bind(this);
        this.attack = this.attack.bind(this);
        this.damageTaken = this.damageTaken.bind(this);
        this.isAttackReleased = this.isAttackReleased.bind(this);
    }

    update() {
        MovingGameObject.prototype.update.call(this);
        this.isAttack = false;

        if (this.shouldAttack && this.params.attack && this.isAttackReleased()) {
            if (this.animations.attack) {
                this.playAnimation(this.animations.attack);
            }

            this.isAttack = true;
            this.shouldAttack = false;
            this.latestAttack = Date.now();
            this.params.attack();
        }

        if (this.isAttackReleased()) {
            if (this.getScalarAcceleration() > 0.02) {
                this.animations.run && this.playAnimation(this.animations.run);
            } else {
                this.animations.stand && this.playAnimation(this.animations.stand);
            }
        }
    }

    isAttackReleased() {
        return (Date.now() - this.latestAttack >= this.params.attackRate);
    }

    attack() {
        this.shouldAttack = true;
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