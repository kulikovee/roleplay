import FiringUnit from './FiringUnit.js';

export default class Player extends FiringUnit {
    constructor(params = {}) {
        super({
            speed: 0.05,
            fireRate: 30,
            damage: 50,
            hp: 100,
            score: 500,
            ...params,
        });

        const findAnimation = name => this.params.gltf.animations.find(animation => animation.name === name);
        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(params.gltf.scene);

        this.animations = {
            stand: this.mixer.clipAction(findAnimation('Stand')).play(),
            run: this.mixer.clipAction(findAnimation('Run')).stop(),
            jump: this.mixer.clipAction(findAnimation('Jump')).stop(),
        };

        /*
          TODO:
          action.idle.setEffectiveWeight( 1 ).play();
          action.run.setEffectiveWeight( 1 ).stop();
          action.jump.setEffectiveWeight( 1 ).stop();
          action.slide.setEffectiveWeight( 1 ).stop();

          action.jump.setLoop( THREE.LoopOnce, 0 );
          action.slide.setLoop( THREE.LoopOnce, 0 );
          action.jump.clampWhenFinished = true;
          action.slide.clampWhenFinished = true;
        */
        this.params.experience = 0;
        this.params.isFire = false;
        this.update = this.update.bind(this);
    }

    playAnimation(animation, force) {
        const animationName =  animation._clip.name;
        const shouldUpdate = this.playingAnimation !== animationName || force;

        if (shouldUpdate) {
            this.playingAnimation = animationName;
            animation.play();

            if (this.animation) {
                var from = this.animation.play();

                from.enabled = true;
                animation.enabled = true;

                from.crossFadeTo(animation, 0.3);
            }

            this.animation = animation;
        }
    }

    update() {
        FiringUnit.prototype.update.call(this);

        const { input, object, acceleration, speed } = this.params;

        if (this.mixer) this.mixer.update(this.clock.getDelta());

        const summaryAcceleration = Math.abs(acceleration.x) + Math.abs(acceleration.y) + Math.abs(acceleration.z);

        if (summaryAcceleration > 0.02) {
            this.playAnimation(this.animations.run);
        } else {
            this.playAnimation(this.animations.stand);
        }

        if (input.mouseLeft) {
            this.fire();
        }

        if (input.look.horizontal) {
            object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -input.look.horizontal / 5000
            );
        }

        acceleration.add(this.getMovingDirection().multiplyScalar(speed));
    }

    getExperience() {
        return this.params.experience;
    }

    getLevel() {
        return Math.floor(Math.sqrt(this.params.experience / 100)) + 1;
    }

    getMovingDirection() {
        return this.getDirection(
            new THREE.Vector3(-this.params.input.horizontal, this.params.input.space, this.params.input.vertical)
        );
    }
}