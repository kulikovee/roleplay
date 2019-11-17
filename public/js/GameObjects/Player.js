import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
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

        const { input, object, acceleration, speed } = this.params;

        if (input.attack1) {
            this.attack();
        }

        if (input.attack2) {
            this.fire();
        }

        this.animationState.isRotateLeft = input.look.horizontal < 0;
        this.animationState.isRotateRight = input.look.horizontal > 0;
        this.animationState.isWalkLeft = this.params.input.horizontal === -1;
        this.animationState.isWalkRight = this.params.input.horizontal === 1;
        this.animationState.isWalkBack = this.params.input.vertical === -1;

        if (input.look.horizontal) {
            object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -input.look.horizontal / 5000
            );
        }

        acceleration.add(this.getMovingAcceleration());
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
        const { speed, input: { horizontal, vertical, space } } = this.params;

        const addForward = (
            vertical > 0
                ? speed
                : (vertical < 0 ? -speed * 0.65 : 0)
        );

        const addSide = -horizontal * speed * 0.65;
        const addUp = Number(space && this.isGrounded()) * 0.25;

        return this.getDirection(new THREE.Vector3(addSide, addUp, addForward));
    }
}