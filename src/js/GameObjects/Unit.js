import MovingGameObject from './MovingGameObject';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            hpMax: params.hp || 100,
            damage: 10,
            attackRate: 0.9,
            hitTime: 0.3,
            attackDamageTimeout: 0.3,
            ...params,
        });

        this.shouldAttack = false;
        this.latestAttackTimestamp = 0;
        this.latestHitTimestamp = 0;

        ['onDamageTaken', 'onDamageDeal', 'onKill', 'onDie'].forEach((eventName) => {
            if (typeof params[eventName] === 'function') {
                this.addEventListener(eventName, params[eventName]);
            }
        });
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.position.y < -150) {
            this.die();
        }

        if (this.isDead()) {
            return;
        }

        const hitReleased = this.isHitReleased(time);

        this.animationState.isHit = !hitReleased;

        if (this.isAttackReleased(time) && hitReleased) {
            this.animationState.isAttack = false;

            if (this.shouldAttack) {
                this.animationState.isAttack = true;
                this.latestAttackTimestamp = time;
                this.params.attack && this.params.attack();
            }
        } else {
            this.shouldAttack = false;
        }
    }

    releaseAttack(time) {
        this.latestAttackTimestamp = time - this.params.attackRate * 1000;
        this.animationState.isAttack = false;
    }

    isAttackReleased(time) {
        return (time - this.latestAttackTimestamp >= this.params.attackRate * 1000);
    }

    isAttackInterrupted(time) {
        return (time - this.latestHitTimestamp <= this.params.attackDamageTimeout * 1000);
    }

    isHitReleased(time) {
        return (time - this.latestHitTimestamp >= this.params.hitTime * 1000);
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

    getAttackTimeout() {
        return this.params.attackDamageTimeout * 1000;
    }

    damageTaken(attackParams, time) {
        if (attackParams) {
            this.params.hp -= attackParams.damage;
            const damageDealerUnit = attackParams.unit;

            this.dispatchEvent('onDamageTaken', damageDealerUnit);

            if (damageDealerUnit) {
                damageDealerUnit.dispatchEvent('onDamageDeal', this);
            }

            this.latestHitTimestamp = time;

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

    getMoney() {
        return this.params.money;
    }

    addMoney(money) {
        this.params.money += money;
    }

    addMaxHP(hp) {
        if (this.isAlive()) {
            this.params.hpMax += hp;
            this.params.hp += hp;
        }
    }

    getHP() {
        return this.params.hp;
    }

    getMaxHP() {
        return this.params.hpMax;
    }

    getSpeed() {
        return this.params.speed;
    }

    getDamage() {
        return this.params.damage;
    }
}