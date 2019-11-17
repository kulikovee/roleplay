import GameObject from './GameObject.js';

const animationNames = {
    stand: 'Stand',
    run: 'Run',
    jump: 'Jump',
    attack: 'Attack',
    rotateLeft: 'Rotate Left',
    rotateRight: 'Rotate Right',
    walkLeft: 'Walk Left',
    walkRight: 'Walk Right',
    walkBack: 'Walk Back',
};

export default class AnimatedGameObject extends GameObject {
    constructor(params = {}) {
        super({ animationNames: { ...animationNames }, ...params });

        this.update = this.update.bind(this);
        this.createClipAction = this.createClipAction.bind(this);
        this.findModelAnimation = this.findModelAnimation.bind(this);
        this.playAnimation = this.playAnimation.bind(this);
        this.getCurrentAnimation = this.getCurrentAnimation.bind(this);
        this.initAnimations = this.initAnimations.bind(this);

        this.animationState = {
            isRun: false,
            isRotateLeft: false,
            isRotateRight: false,
            isAttack: false,
            isJump: false,
            isWalkRight: false,
            isWalkLeft: false,
        };

        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(this.params.object);

        this.initAnimations(this.params.animationNames);
    }

    update() {
        GameObject.prototype.update.call(this);

        if (this.mixer) this.mixer.update(this.clock.getDelta());

        const animation = this.getCurrentAnimation();

        animation && this.playAnimation(animation);
    }

    playAnimation(animation, { force } = {}) {
        if (!animation || !animation._clip) return;

        const animationName = animation._clip.name;
        const shouldUpdate = this.playingAnimationName !== animationName || force;

        if (shouldUpdate) {
            this.playingAnimationName = animationName;
            animation.reset();
            animation.play();

            if (this.playingAnimation) {
                var from = this.playingAnimation;

                from.enabled = true;
                animation.enabled = true;

                from.crossFadeTo(animation, 0.3);
            }

            this.playingAnimation = animation;
        }
    }

    initAnimations(animationNames) {
        this.animations = Object.keys(animationNames).reduce(
            (result, key) => {
                const modelAnimation = this.findModelAnimation(animationNames[key]);
                const initedAnimation = this.createClipAction(modelAnimation);

                if (initedAnimation) { initedAnimation.setEffectiveWeight(1); }

                return { ...result, [key]: initedAnimation };
            },
            {}
        );

        const { animations: { jump, attack } = {} } = this;

        if (jump) {
            jump.setLoop(THREE.LoopOnce, 0);
            jump.clampWhenFinished = true;
        }


        if (attack) {
            attack.setDuration(this.params.attackRate);
        }
    }

    createClipAction(action) {
        return action && this.mixer.clipAction(action).stop();
    }

    findModelAnimation(name) {
        const { animations = [] } = this.params;

        return animations.find(animation => animation.name === name);
    }

    getCurrentAnimation() {
        const {
            animations: {
                stand,
                attack,
                walkBack,
                walkLeft,
                walkRight,
                run,
                jump,
                rotateLeft,
                rotateRight,
            } = {}
        } = this;

        const {
            isAttack,
            isRun,
            isJump,
            isWalkLeft,
            isWalkRight,
            isWalkBack,
            isRotateLeft,
            isRotateRight,
        } = this.animationState;

        let animation = stand;

        if (isAttack && attack) {
            animation = attack;
        }

        if (!isAttack && isJump) {
            animation = jump;
        }

        if (!isJump && !isAttack && isRun) {
            if (isWalkBack && walkBack) {
                animation = walkBack;
            } else if (isWalkLeft && walkLeft) {
                animation = walkLeft;
            } else if (isWalkRight && walkRight) {
                animation = walkRight;
            } else if (run) {
                animation = run;
            }
        }

        if (!isJump && !isAttack && !isRun) {
            if (isRotateLeft && rotateLeft) {
                animation = rotateLeft;
            } else if (isRotateRight && rotateRight) {
                animation = rotateRight;
            }
        }

        return animation;
    }
}