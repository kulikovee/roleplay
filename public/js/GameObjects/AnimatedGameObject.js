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
    topRunRight: 'Top Run Right',
    topRunLeft: 'Top Run Left',
    topJump: 'Top Jump',
    bottomRunRight: 'Bottom Run Right',
    bottomRunLeft: 'Bottom Run Left',
    bottomJump: 'Bottom Jump',
};

const topAnimations = [
    'topRun',
    'topWalkBack',
    'topAttack',
    'topStand',
    'topRunRight',
    'topRunLeft',
    'topJump',
];

const bottomAnimations = [
    'bottomRun',
    'bottomWalkBack',
    'bottomAttack',
    'bottomStand',
    'bottomRunRight',
    'bottomRunLeft',
    'bottomJump',
];

const topBones = [
    'Right_Forearm',
    'Right_Arm',
    'Right_Hand',
    'Right_Hand_end',
    'Right_Shoulder',
    'Left_Shoulder',
    'Left_Forearm',
    'Left_Arm',
    'Left_Hand',
    'Left_Hand_end',
    'Chest',
    'Neck',
    'Head',
    'Head_end'
];

const bottomBones = [
    'Main_Bone',
    'Right_Leg',
    'Right_Middle_Foot',
    'Right_Foot',
    'Right_Foot_end',
    'Left_Leg',
    'Left_Middle_Foot',
    'Left_Foot',
    'Left_Foot_end',
];

export default class AnimatedGameObject extends GameObject {
    constructor(params = {}) {
        super({
            animationNames: { ...animationNames },
            topBones: [...topBones],
            bottomBones: [...bottomBones],
            topAnimations: [...topAnimations],
            bottomAnimations: [...bottomAnimations],
            ...params
        });

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
        const {
            topAnimations,
            bottomAnimations,
            topBones,
            bottomBones,
            complexAnimations,
        } = this.params;

        this.animations = Object.keys(animationNames).reduce(
            (result, key) => {
                let excludedBones = [];

                if (complexAnimations) {
                    if (topAnimations.includes(key)) {
                        excludedBones = bottomBones;
                    } else if (bottomAnimations.includes(key)) {
                        excludedBones = topBones;
                    }
                }

                const modelAnimation = this.findModelAnimation(animationNames[key], { excludedBones });
                let initedAnimation = this.createClipAction(modelAnimation);

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

    findModelAnimation(name, { excludedBones = [] } = {}) {
        const { animations = [] } = this.params;

        let animation = animations.find(animation => animation.name === name);

        if (animation && excludedBones.length) {
            return this.clearAnimationBones(animation, excludedBones);
        }

        return animation;
    }

    clearAnimationBones(animation, bones) {
        if (animation) {
            const getBoneName = item => item.name.split('.')[0],
                isNotExcluded = item => !bones.includes(getBoneName(item));

            animation.tracks = animation.tracks.filter(isNotExcluded);

            return animation;
        }
    }

    updateComplexAnimations() {
        const {
            animations: {
                topAttack, bottomAttack,
                topWalkBack, bottomWalkBack,
                topRun, bottomRun,
                topRunRight, bottomRunRight,
                topRunLeft, bottomRunLeft,
                topStand, bottomStand,
                topJump, bottomJump,
            } = {}
        } = this;

        const {
            isAttack,
            isRun,
            isRunRight,
            isRunLeft,
            isJump,
            isWalkBack,
        } = this.animationState;

        const playingAnimations = {
            top: (
                (isAttack && topAttack)
                || (isJump && topJump)
                || (isRunRight && topRunRight)
                || (isRunLeft && topRunLeft)
                || (isWalkBack && topWalkBack)
                || (isRun && topRun)
                || ((!isAttack && !isRun && topStand))
            ),
            bottom: (
                (isAttack  && !isRun && bottomAttack)
                || (isJump && bottomJump)
                || (isRunRight && bottomRunRight)
                || (isRunLeft && bottomRunLeft)
                || (isWalkBack && bottomWalkBack)
                || (isRun && !isWalkBack && bottomRun)
                || (!isAttack && !isRun && bottomStand)
            ),
        };

        this.blendAnimations(playingAnimations);
    }

    blendAnimations({ top, bottom }) {
        if (!top || !bottom || !top._clip || !bottom._clip) return;
        const getAnimationName = a => a._clip.name,
            playAnimation = (fromAnimation, animation) => {
                const animationName = getAnimationName(animation);
                const fromAnimationName = fromAnimation && getAnimationName(fromAnimation);

                if (fromAnimationName !== animationName) {
                    animation.reset();
                    animation.play();
                    // animation.setEffectiveWeight(1);

                    if (fromAnimation) {
                        // fromAnimation.setEffectiveWeight(0);
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