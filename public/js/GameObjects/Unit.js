import MovingGameObject from './MovingGameObject.js';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            damage: 10,
            attackRate: 0.9,
            ...params,
        });

        this.shouldAttack = false;
        this.latestAttackTimestamp = Date.now() - this.params.attackRate;

        ['onDamageTaken', 'onDamageDeal', 'onKill', 'onDie'].forEach((eventName) => {
            if (typeof params[eventName] === 'function') {
                this.addEventListener(eventName, params[eventName]);
            }
        });

        this.update = this.update.bind(this);
        this.attack = this.attack.bind(this);
        this.damageTaken = this.damageTaken.bind(this);
        this.isAttackReleased = this.isAttackReleased.bind(this);
        this.isDead = this.isDead.bind(this);
    }

    update() {
        MovingGameObject.prototype.update.call(this);

        if (this.isDead()) {
            return;
        }

        if (this.isAttackReleased()) {
            this.animationState.isAttack = false;

            if (this.shouldAttack) {
                this.animationState.isAttack = true;
                this.latestAttackTimestamp = Date.now();
                this.params.attack && this.params.attack();
            }
        } else {
            this.shouldAttack = false;
        }
    }

    isAttackReleased() {
        return (Date.now() - this.latestAttackTimestamp >= this.params.attackRate * 1000);
    }

    attack() {
        this.shouldAttack = true;
    }

    isDead() {
        return this.params.hp <= 0;
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

            if (this.isDead()) {
                this.dispatchEvent('onDie', fireParent);
                this.animationState.isDie = true;

                if (fireParent) {
                    fireParent.dispatchEvent('onKill', this);
                }
            }
        }
    }
}