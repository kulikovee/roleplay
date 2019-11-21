import GameObject from './GameObject.js';

const animationNames = {
    stand: 'Stand',
    run: 'Run',
    jump: 'Jump',
    attack: 'Attack',
    rotateLeft: 'Rotate Left',
    rotateRight: 'Rotate Right',
    runLeft: 'Run Left',
    runRight: 'Run Right',
    walkBack: 'Walk Back',

    // Complex animimations
    topRun: 'Top Run',
    bottomRun: 'Bottom Run',
    topWalkBack: 'Top Walk Back',
    bottomWalkBack: 'Bottom Walk Back',
    topAttack: 'Top Attack',
    bottomAttack: 'Bottom Attack',
    topStand: 'Top Stand',
    bottomStand: 'Bottom Stand',
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
        this.updateComplexAnimations = this.updateComplexAnimations.bind(this);
        this.blendAnimations = this.blendAnimations.bind(this);

        this.animationState = {
            isRun: false,
            isRotateLeft: false,
            isRotateRight: false,
            isAttack: false,
            isJump: false,
            isRunRight: false,
            isRunLeft: false,
        };

        this.playingAnimations = {};

        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(this.params.object);

        this.initAnimations(this.params.animationNames);
    }

    update() {
        GameObject.prototype.update.call(this);

        if (this.mixer) this.mixer.update(this.clock.getDelta());

        if (this.params.complexAnimations) {
            this.updateComplexAnimations();
        } else {
            const animation = this.getCurrentAnimation();
            animation && this.playAnimation(animation);
        }
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

                if (initedAnimation) {
                    initedAnimation.setEffectiveWeight(1);
                    // initedAnimation.enabled = true;
                }

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

    updateComplexAnimations() {
        const {
            animations: {
                topAttack, bottomAttack,
                topWalkBack, bottomWalkBack,
                topRun, bottomRun,
                topStand, bottomStand,
            } = {}
        } = this;

        const {
            isAttack,
            isRun,
            isWalkBack,
        } = this.animationState;

        const playingAnimations = {
            top: (
                (isAttack && topAttack)
                || (isWalkBack && !isAttack && topWalkBack)
                || (isRun && !isWalkBack && !isAttack && topRun)
                || ((!isAttack && !isRun && topStand))
            ),
            bottom: (
                (isAttack  && !isRun && bottomAttack)
                || (isWalkBack && bottomWalkBack)
                || (isRun && !isWalkBack && bottomRun)
                || (!isAttack && !isRun && bottomStand)
            ),
        };

        // console.log(
        //     playingAnimations && playingAnimations.top && playingAnimations.top._clip.name,
        //     ';',
        //     playingAnimations && playingAnimations.bottom && playingAnimations.bottom._clip.name,
        //     ';',
        //     `isRun: ${isRun}, isAttack: ${isAttack}, isWalkBack: ${isWalkBack}`
        // );

        this.blendAnimations(playingAnimations);
    }

    blendAnimations({ top, bottom }) {
        if (!top || !bottom || !top._clip || !bottom._clip) return;

        const playAnimation = (fromAnimation, animation) => {
            const animationName = animation._clip.name;
            const fromAnimationName = fromAnimation && fromAnimation._clip.name;

            if (fromAnimationName !== animationName) {
                console.log('Play animation', animationName, 'coming from', fromAnimationName);

                animation.reset();
                animation.play();

                if (fromAnimation) {
                    fromAnimation.crossFadeTo(animation, 0.3);
                }
            }
        };

        playAnimation(this.playingAnimations.top, top);
        playAnimation(this.playingAnimations.bottom, bottom);

        this.playingAnimations.top = top;
        this.playingAnimations.bottom = bottom;
    }

    getCurrentAnimation() {
        const {
            animations: {
                stand,
                attack,
                walkBack,
                runLeft,
                runRight,
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
            isRunLeft,
            isRunRight,
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
            } else if (isRunLeft && runLeft) {
                animation = runLeft;
            } else if (isRunRight && runRight) {
                animation = runRight;
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