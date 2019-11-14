import GameObject from './GameObject.js';

export default class AnimatedGameObject extends GameObject {
    constructor(params = {}) {
        super({
            animationKeys: {
                stand: 'Stand',
                run: 'Run',
                jump: 'Jump',
                attack: 'Attack',
            },
            ...params
        });

        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(this.params.object);

        this.animations = Object.keys(this.params.animationKeys).reduce(
            (result, key) => ({
                ...result,
                [key]: this.createClipAction(
                    this.findModelAnimation(this.params.animationKeys[key])
                ),
            }),
            {}
        );

        this.animations.stand && this.playAnimation(this.animations.stand);

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

        this.update = this.update.bind(this);
        this.createClipAction = this.createClipAction.bind(this);
        this.findModelAnimation = this.findModelAnimation.bind(this);
        this.playAnimation = this.playAnimation.bind(this);
    }

    update() {
        GameObject.prototype.update.call(this);
        if (this.mixer) this.mixer.update(this.clock.getDelta());
    }

    playAnimation(animation, { force } = {}) {
        if (!animation || !animation._clip) return;

        const animationName = animation._clip.name;
        const shouldUpdate = this.playingAnimation !== animationName || force;

        if (shouldUpdate) {
            this.playingAnimation = animationName;
            animation.time = 0;
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

    createClipAction(action) {
        return action && this.mixer.clipAction(action).stop();
    }

    findModelAnimation(name) {
        const { animations = [] } = this.params;
        return animations.find(animation => animation.name === name);
    }
}