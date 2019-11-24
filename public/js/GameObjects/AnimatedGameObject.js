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
    die: 'Die',

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
    'Legs_Rotation',
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
            isRunRight: false,
            isRunLeft: false,
            isWalkBack: false,
            isRotateLeft: false,
            isRotateRight: false,
            isAttack: false,
            isJump: false,
            isDie: false,
        };

        this.playingAnimations = {};
        this.legsRotationY = 0;

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

        const { animations: { jump, attack, topAttack, die } = {} } = this;

        if (jump) {
            jump.setLoop(THREE.LoopOnce, 0);
            jump.clampWhenFinished = true;
        }

        if (die) {
            die.setLoop(THREE.LoopOnce, 0);
            die.clampWhenFinished = true;
        }

        if (attack) {
            attack.setDuration(this.params.attackRate);
        }

        if (topAttack) {
            topAttack.setDuration(this.params.attackRate);
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
                topRunRight,
                topRunLeft,
                topStand, bottomStand,
                topJump, bottomJump,
                die,
            } = {}
        } = this;

        const {
            isAttack,
            isRun,
            isRunRight,
            isRunLeft,
            isJump,
            isWalkBack,
            isRunForward,
            isDie,
        } = this.animationState;

        const playingAnimations = {
            top: (
                (isAttack && topAttack)
                || (isJump && topJump)
                || (isRunRight && topRunRight)
                || (isRunLeft && topRunLeft)
                || (isWalkBack && topWalkBack)
                || (isRun && topRun)
                || (topStand)
            ),
            bottom: (
                (isJump && bottomJump)
                || (isRun && bottomRun)
                || (isWalkBack && bottomWalkBack)
                || (isAttack && bottomAttack)
                || (bottomStand)
            ),
            whole: isDie && die,
        };

        const legsRotationBone = this.getChildByName('Legs_Rotation');
        if (legsRotationBone) {
            const { rotation } = legsRotationBone;
            let y = -0.3;

            if (isRunLeft) {
                y = isRunForward
                    ? 0.5
                    : isWalkBack ? 2 : 1;
            } else if (isRunRight) {
                y = isRunForward
                    ? -1.2
                    : isWalkBack ? -2.5 : -1.7;
            }

            this.legsRotationY = this.legsRotationY - (this.legsRotationY - y) / 10;
            rotation.set(rotation.x, this.legsRotationY, rotation.z);
        }


        this.blendAnimations(playingAnimations);
    }

    blendAnimations({ top, bottom, whole }) {
        const isTopBottom = (top && bottom && top._clip && bottom._clip);
        const isWhole = whole && whole._clip;

        if (!isTopBottom && !isWhole) return;

        const getAnimationName = a => a._clip.name,
            playAnimation = (fromAnimation, animation) => {
                const animationName = getAnimationName(animation);
                const fromAnimationName = fromAnimation && getAnimationName(fromAnimation);

                if (fromAnimationName !== animationName) {
                    animation.reset();
                    animation.play();

                    if (fromAnimation) {
                        fromAnimation.crossFadeTo(animation, 0.3);
                    }
                }
            };

        if (isWhole) {
            playAnimation(this.playingAnimations.top, whole);
            this.playingAnimations.top = whole;
            this.playingAnimations.bottom = whole;
        } else {
            playAnimation(this.playingAnimations.top, top);
            playAnimation(this.playingAnimations.bottom, bottom);

            this.playingAnimations.top = top;
            this.playingAnimations.bottom = bottom;
        }
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
                die,
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
            isDie,
        } = this.animationState;

        return (
            (isDie && die)
            || (isAttack && attack)
            || (isJump && jump)
            || (isWalkBack && walkBack)
            || (isRunLeft && runLeft)
            || (isRunRight && runRight)
            || (isRun && run)
            || (isRotateLeft && rotateLeft)
            || (isRotateRight && rotateRight)
            || stand
        );
    }
}