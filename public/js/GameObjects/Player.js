import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.055,
            fireRate: 30,
            damage: 50,
            hp: 100,
            experience: 0,
            score: 500,
            isFire: false,
            mas: 1,
            ...params,
        });

        console.log('Player', this);

        this.update = this.update.bind(this);
        this.getExperience = this.getExperience.bind(this);
        this.getLevel = this.getLevel.bind(this);
        this.getMovingAcceleration = this.getMovingAcceleration.bind(this);
        this.getFireInitialPosition = this.getFireInitialPosition.bind(this);
        this.getFireInitialRotation = this.getFireInitialRotation.bind(this);
        this.isGrounded = this.isGrounded.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);
        if (this.isDead()) {
            return;
        }

        const { input, object, acceleration, speed } = this.params;

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

        acceleration.add(this.getMovingAcceleration());

        if (input.isThirdPerson) {
            const horizontalLook = input.look.horizontal;

            this.animationState.isRotateLeft = horizontalLook < 0;
            this.animationState.isRotateRight = horizontalLook > 0;

            if (horizontalLook) {
                object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -horizontalLook / 5000);
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

    getFireInitialPosition() {
        const head = this.getChildByName('Head');
        const headForward = Player.prototype.getForward.call({ params: { object: head } });
        const headUp = Player.prototype.getDirection.call({ params: { object: head } }, new THREE.Vector3(0, 1, 0));

        return this.getChildPosition('Head')
            .add(headUp.multiplyScalar(0.15))
            .add(headForward.multiplyScalar(0.25));
    }

    getFireInitialRotation() {
        return this.getChildRotation('Head');
    }

    getExperience() {
        return this.params.experience;
    }

    getLevel() {
        return Math.floor(Math.sqrt(this.params.experience / 100)) + 1;
    }

    isGrounded() {
        return this.position.y === 0;
    }

    getMovingAcceleration() {
        const { input: { horizontal, vertical, jump } } = this.params;

        const speed = vertical && horizontal
            ? this.params.speed * 0.7
            : this.params.speed;

        const addForward = vertical === 1
            ? speed
            : (vertical === -1 ? -speed * 0.6 : 0);

        const addSide = vertical === -1
            ? (-horizontal * speed * 0.6)
            : (-horizontal * speed);

        const addUp = Number(jump && this.isGrounded()) * 0.25;

        return this.getDirection(new THREE.Vector3(addSide, addUp, addForward));
    }
}