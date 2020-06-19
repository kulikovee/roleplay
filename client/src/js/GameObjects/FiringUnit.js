import Unit from './Unit';

export default class FiringUnit extends Unit {
    constructor(params = {}) {
        super({
            fireDamage: 10,
            fireTimeOffset: 0.4,
            fireTimeout: 1.5,
            fireShellSpeed: 3,
            ...params
        });

        this.isFire = false;
        this.shouldFire = false;
        this.latestFire = 0;
    }

    getFireInitialPosition() {
        return this.position.clone().add(
            this.getUp()
                .multiplyScalar(1.5)
                .add(this.getForward().multiplyScalar(0.5))
                .add(this.getLeft().multiplyScalar(0.2))
        );
    }

    getFireInitialRotation() {
        return this.rotation;
    }

    getFireDamage() {
        return this.params.fireDamage;
    }

    addFireDamage(fireDamage) {
        return this.params.fireDamage += fireDamage;
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        if (this.shouldFire && this.params.fire && this.isFireReleased(time) && this.isAttackReleased(time)) {
            this.isFire = true;
            this.shouldFire = false;
            this.latestFire = time;
        } else {
            this.shouldFire = false;
        }

        if (this.isFire && time - this.latestFire >= this.params.fireTimeOffset * 1000) {
            this.params.fire();
            this.isFire = false;
        }

        if (!this.animationState.isAttack && !this.animationState.isAttackWeapon1) {
            this.animationState.isAttack = !this.isFireReleased(time);
        }
    }

    isFireReleased(time) {
        return time - this.latestFire >= this.params.fireTimeout * 1000;
    }

    fire() {
        this.shouldFire = true;
    }
}