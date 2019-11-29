import MovingGameObject from './MovingGameObject.js';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            hpMax: params.hp || 100,
            damage: 10,
            attackRate: 0.9,
            ...params,
        });

        this.shouldAttack = false;
        this.latestAttackTimestamp = Date.now() - this.params.attackRate * 1000;

        ['onDamageTaken', 'onDamageDeal', 'onKill', 'onDie'].forEach((eventName) => {
            if (typeof params[eventName] === 'function') {
                this.addEventListener(eventName, params[eventName]);
            }
        });
    }

    update() {
        MovingGameObject.prototype.update.call(this);

        if (this.position.y < -150) {
            this.die();
        }

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

    isAlive() {
        return !this.isDead();
    }

    damageTaken(attackParams) {
        if (attackParams) {
            this.params.hp -= attackParams.params.damage;
            const damageDealerUnit = attackParams.params.parent;

            this.dispatchEvent('onDamageTaken', damageDealerUnit);

            if (damageDealerUnit) {
                damageDealerUnit.dispatchEvent('onDamageDeal', this);
            }

            if (this.isDead()) {
                this.die(damageDealerUnit);
            }
        }
    }

    die(killingUnit) {
        this.params.hp = 0;
        this.dispatchEvent('onDie', killingUnit);
        this.animationState.isDie = true;

        if (killingUnit) {
            killingUnit.dispatchEvent('onKill', this);
        }
    }

    addSpeed(speed) {
        this.params.speed += speed;
    }

    addDamage(damage) {
        this.params.damage += damage;
    }

    addHP(hp) {
        if (this.isAlive()) {
            this.params.hp = Math.min(this.params.hp + hp, this.params.hpMax);
        }
    }

    addMaxHP(hp) {
        if (this.isAlive()) {
            this.params.hpMax += hp;
            this.params.hp += hp;
        }
    }
}