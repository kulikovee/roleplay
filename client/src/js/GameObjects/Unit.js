import MovingGameObject from './MovingGameObject';

export default class Unit extends MovingGameObject {
    constructor(params = {}) {
        super({
            hp: 100,
            hpMax: params.hp || 100,
            damage: 10,
            attackTimeout: 0.9,
            hitTime: 0.3,
            attackDamageTimeout: 0.3,
            equippedItems: {
                leftHand: null,
            },
            ...params,
        });

        this._attachedModels = {};

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

        if (this.isDead()) {
            return;
        }

        const hitReleased = this.isHitReleased(time);

        this.animationState.isHit = !hitReleased;

        if (this.isAttackReleased(time) && hitReleased) {
            this.animationState.isAttack = false;
            this.animationState.isAttackWeapon1 = false;

            if (this.shouldAttack) {
                if (this.params.equippedItems && this.params.equippedItems.leftHand) {
                    this.animationState.isAttackWeapon1 = true;
                } else {
                    this.animationState.isAttack = true;
                }

                this.latestAttackTimestamp = time;
                this.params.attack && this.params.attack();
            }
        } else {
            this.shouldAttack = false;
        }
    }

    getFraction() {
        return this.params.fraction;
    }

    getCollider(position) {
        const diffY = position.y - this.position.y;

        return (
            Math.sqrt(
                Math.pow(position.x - this.position.x, 2)
                + Math.pow(position.z - this.position.z, 2)
            ) < 1
            && diffY >= 0
            && diffY < 1.7
        );
    }

    releaseAttack(time) {
        this.latestAttackTimestamp = time - this.params.attackTimeout * 1000;
        this.animationState.isAttack = false;
        this.animationState.isAttackWeaponAttach1 = false;
    }

    isAttackReleased(time) {
        return (time - this.latestAttackTimestamp >= this.params.attackTimeout * 1000);
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
    
    isEnemy(unit) {
        return (
            unit.params.fraction !== this.params.fraction
            && unit.params.fraction !== 'neutral'
            && this.params.fraction !== 'neutral'
        );
    }

    getLevel() {
        return this.params.level;
    }

    getName() {
        return this.params.name;
    }

    getAttackTimeout() {
        return this.params.attackDamageTimeout * 1000;
    }

    damageTaken({ damage, unit: attacker } = {}, time) {
        if (damage && attacker) {
            this.params.hp -= damage;

            this.dispatchEvent('onDamageTaken', attacker);

            if (attacker) {
                attacker.dispatchEvent('onDamageDeal', this);
            }

            const interruptByChance = Math.random() < 0.33;
            const interruptByLevel = attacker.getLevel() - this.getLevel() > 2;
            const shouldBeInterrupted = interruptByLevel || interruptByChance;

            if (shouldBeInterrupted) {
                this.latestHitTimestamp = time;
            }

            if (this.isDead()) {
                this.die(attacker);
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
        return this.params.damage + this.getDamageFromEffects();
    }

    getDamageFromEffects() {
        let damage = 0;
        const { equippedItems } = this.params;

        if (equippedItems) {
            const { leftHand } = equippedItems;

            if (leftHand) {
                leftHand.effects.forEach((effect) => {
                    if (effect.damage) {
                        damage += effect.damage;
                    }
                });
            }
        }

        return damage;
    }
}