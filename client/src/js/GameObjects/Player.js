import FiringUnit from './FiringUnit';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.54,
            fireTimeout: 1,
            fireDamage: 25,
            damage: 50,
            hp: 100,
            experience: 0,
            unspentTalents: 0,
            money: 500,
            isFire: false,
            mas: 1,
            level: 1,
            jumpTimeout: 0.9,
            fraction: 'friendly',
            sensitivity: 1,
            ...params,
        });

        this.lastJumpTimestamp = 0;
        this.rotationAcceleration = 0;

        // console.log('Player', this);

        params.onLevelUp && this.addEventListener('onLevelUp', params.onLevelUp);
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);

        if (this.isDead()) {
            return;
        }

        const { input, object, acceleration, fromNetwork } = this.params;

        acceleration.add(this.getMovingAcceleration(time, deltaTime));

        if (input.attack1) {
            this.attack();
        }

        if (input.attack2) {
            this.fire();
        }

        this.animationState.isMovingLeft = input.horizontal === -1;
        this.animationState.isMovingRight = input.horizontal === 1;
        this.animationState.isMovingForward = input.vertical === 1;
        this.animationState.isMovingBackward = input.vertical === -1;

        if (!fromNetwork) {
            if (input.isThirdPerson) {
                if (input.look.horizontal) {
                    const horizontalLook = input.look.horizontal;
                    this.animationState.isRotateLeft = horizontalLook < 0;
                    this.animationState.isRotateRight = horizontalLook > 0;
                    this.rotationAcceleration += (-horizontalLook / 5000) * input.look.sensitivity;
                    input.resetHorizontalLook();
                }

                const CALC_ROTATE_THRESHOLD = 0.0000001;

                if (Math.abs(this.rotationAcceleration) > CALC_ROTATE_THRESHOLD) {
                    object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), this.rotationAcceleration);
                    this.rotationAcceleration *= 0.7;
                }
            } else {
                const deltaX = window.innerWidth / 2 - input.cursor.x;
                const deltaY = input.cursor.y - window.innerHeight / 2;
                const rotationY = Math.atan2(deltaY, deltaX);

                this.animationState.isRotateLeft = rotationY > object.rotation.y;
                this.animationState.isRotateRight = rotationY < object.rotation.y;

                object.rotation.set(0, rotationY, 0);
            }
        }
    }

    getUnspentTalents() {
        return this.params.unspentTalents;
    }

    decreaseUnspentTalents() {
        return this.params.unspentTalents--;
    }

    getFireInitialPosition() {
        const head = this.getChildByName('Head') || this.object;
        const headForward = this.getChildDirection(head, new THREE.Vector3(0, 0, 1));
        const headUp = new THREE.Vector3(0, 1, 0);
        headUp.applyQuaternion(head.quaternion);

        return this.getChildPosition(head)
            .add(headUp.multiplyScalar(0.15))
            .add(headForward.multiplyScalar(0.25));
    }

    getFireInitialRotation() {
        return this.getChildRotation('Head');
    }

    addExperience(experience) {
        this.params.experience += experience;

        const level = this.getLevel();

        if (this.params.level !== level) {
            const levelsUp = level - this.params.level;

            this.params.level = level;
            this.params.unspentTalents += 3 * levelsUp;
            this.params.hp = this.params.hpMax;
            this.dispatchEvent('onLevelUp', level);
        }
    }

    getExperience() {
        return this.params.experience;
    }

    getLevelExperience() {
        return Math.pow(this.getLevel(), 2) * 100;
    }

    getLevel() {
        return Math.floor(Math.sqrt(this.params.experience / 100)) + 1;
    }

    getMovingAcceleration(time, deltaTime) {
        const { input: { horizontal, vertical, jump } } = this.params;

        const speed = vertical && horizontal
            ? this.params.speed * 0.1 * 0.7 * (deltaTime * 0.06)
            : this.params.speed * 0.1 * (deltaTime * 0.06);

        const addForward = vertical === 1
            ? speed
            : (vertical === -1 ? -speed * 0.6 : 0);

        const addSide = vertical === -1
            ? (-horizontal * speed * 0.6)
            : (-horizontal * speed );

        const isJump = (
            time - this.lastJumpTimestamp > this.params.jumpTimeout * 1000
            && jump
            && this.isGrounded
        );

        if (isJump) {
            this.lastJumpTimestamp = time;
        }

        return this.getDirection(new THREE.Vector3(addSide, Number(isJump) * 0.25, addForward));
    }
}