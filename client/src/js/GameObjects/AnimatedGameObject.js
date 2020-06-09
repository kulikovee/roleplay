import GameObject from './GameObject';

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
    spawn: 'Spawn',
    hit: 'Hit',

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
    topHit: 'Top Hit',
    bottomRunRight: 'Bottom Run Right',
    bottomRunLeft: 'Bottom Run Left',
    bottomJump: 'Bottom Jump',
    bottomHit: 'Bottom Hit',
    topDie: 'Top Die',
    bottomDie: 'Bottom Die',
    topSpawn: 'Top Spawn',
    bottomSpawn: 'Bottom Spawn',
};

const topAnimations = [
    'topRun',
    'topWalkBack',
    'topAttack',
    'topStand',
    'topRunRight',
    'topRunLeft',
    'topJump',
    'topHit',
    'topDie',
];

const bottomAnimations = [
    'bottomRun',
    'bottomWalkBack',
    'bottomAttack',
    'bottomStand',
    'bottomRunRight',
    'bottomRunLeft',
    'bottomJump',
    'bottomHit',
    'bottomDie',
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
            spawnTimeout: 1,
            ...params
        });

        this.animationState = {
            isMovingForward: false,
            isMovingRight: false,
            isMovingLeft: false,
            isMovingBackward: false,
            isRotateLeft: false,
            isRotateRight: false,
            isAttack: false,
            isJump: false,
            isDie: false,
            isHit: false,
            isSpawn: true,
        };

        this.playingAnimations = {};
        this.legsRotationY = 0;
        this.spawnTime = 0;

        this.mixer = new THREE.AnimationMixer(this.params.object);

        this.initAnimations(this.params.animationNames);
    }

    update(time, deltaTime) {
        super.update(time, deltaTime);
        
        if (!this.spawnTime) {
            this.spawnTime = time;
        } else if (this.animationState.isSpawn && this.isSpawnFinished(time)) {
            this.animationState.isSpawn = false;
        }

        if (this.mixer) {
            this.mixer.update(deltaTime / 1000);
        }

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

        const {
            animations: {
                jump,
                attack,
                topAttack,
                die,
                spawn,
                topDie,
                bottomDie,
                topJump,
                bottomJump,
                bottomAttack
            } = {}
        } = this;

        [jump, die, spawn, topDie, bottomDie, topJump, bottomJump].forEach((clampAnimation) => {
            if (clampAnimation) {
                clampAnimation.setLoop(THREE.LoopOnce, 0);
                clampAnimation.clampWhenFinished = true;
            }
        });

        [attack, topAttack, bottomAttack].forEach((attackAnimation) => {
            if (attackAnimation) {
                attackAnimation.setDuration(this.params.attackTimeout);
            }
        });
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

    isMoving() {
        return (
            this.animationState.isMovingLeft
            || this.animationState.isMovingRight
            || this.animationState.isMovingForward
            || this.animationState.isMovingBackward
        );
    }

    isSpawnFinished(time) {
        return time - this.spawnTime > this.params.spawnTimeout * 1000;
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
                topHit, bottomHit,
                topDie, bottomDie,
                topSpawn, bottomSpawn,
            } = {}
        } = this;

        const {
            isAttack,
            isMovingRight,
            isMovingLeft,
            isMovingBackward,
            isMovingForward,
            isJump,
            isDie,
            isHit,
            isSpawn,
        } = this.animationState;

        const playingAnimations = {
            top: (
                (isDie && topDie)
                || (isHit && topHit)
                || (isAttack && topAttack)
                || (isJump && topJump)
                || (isMovingBackward && isMovingRight && topRunLeft)
                || (isMovingBackward && isMovingLeft && topRunRight)
                || (isMovingBackward && topWalkBack)
                || (isMovingRight && topRunRight)
                || (isMovingLeft && topRunLeft)
                || (isMovingForward && topRun)
                || (isSpawn && topSpawn)
                || (topStand)
            ),
            bottom: (
                (isDie && bottomDie)
                || (isJump && bottomJump)
                || (isMovingBackward && isMovingRight && bottomWalkBack)
                || (isMovingBackward && isMovingLeft && bottomWalkBack)
                || (isMovingBackward && bottomWalkBack)
                || (isMovingRight && bottomRun)
                || (isMovingLeft && bottomRun)
                || (isMovingForward && bottomRun)
                || (isAttack && bottomAttack)
                || (isHit && bottomHit)
                || (isSpawn && bottomSpawn)
                || (bottomStand)
            ),
        };

        const legsRotationBone = this.getChildByName('Legs_Rotation');
        if (legsRotationBone) {
            const { rotation } = legsRotationBone;
            let y = -0.3;

            if (isMovingLeft) {
                y = isMovingForward
                    ? 0.5
                    : isMovingBackward ? -0.7 : 1;
            } else if (isMovingRight) {
                y = isMovingForward
                    ? -1.2
                    : isMovingBackward ? 0.4 : -1.7;
            }

            this.legsRotationY = this.legsRotationY - (this.legsRotationY - y) / 10;
            rotation.set(rotation.x, this.legsRotationY, rotation.z);
        }

        this.blendAnimations(playingAnimations);
    }

    blendAnimations({ top, bottom }) {
        if (!(top && bottom && top._clip && bottom._clip)) return;

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
                hit,
                rotateLeft,
                rotateRight,
                die,
                spawn,
            } = {}
        } = this;

        const {
            isAttack,
            isMovingForward,
            isJump,
            isMovingLeft,
            isMovingRight,
            isMovingBackward,
            isRotateLeft,
            isRotateRight,
            isDie,
            isHit,
            isSpawn,
        } = this.animationState;

        return (
            (isDie && die)
            || (isHit && hit)
            || (isAttack && attack)
            || (isJump && jump)
            || (isMovingBackward && walkBack)
            || (isMovingLeft && runLeft)
            || (isMovingRight && runRight)
            || (isMovingForward && run)
            || (isRotateLeft && rotateLeft)
            || (isRotateRight && rotateRight)
            || (isSpawn && spawn)
            || stand
        );
    }
}