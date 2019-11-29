import AutoBindMethods from './AutoBindMethods.js';

export default class Intervals extends AutoBindMethods {
    constructor(scene) {
        super();

        this.scene = scene;
        this.timePassed = 0;
        this.lastFrame = Date.now();
        this.intervals = [];
        this.intervalIndex = 0;
    }

    update() {
        if (this.scene.ui && !this.scene.ui.pause) {
            this.timePassed += Date.now() - this.lastFrame;

            this.intervals
                .filter(i => this.timePassed - i.calledAt > i.interval)
                .forEach((interval) => {
                    interval.calledAt = this.timePassed;
                    interval.fn();

                    if (interval.loops && --interval.loops === 0) {
                        this.clearInterval(interval.id);
                    }
                });
        }

        this.lastFrame = Date.now();
    }

    setInterval(fn, interval, immediately, loops) {
        if (fn && interval) {
            const calledAt = immediately ? this.timePassed - interval : this.timePassed;

            this.intervals.push({
                fn,
                interval,
                calledAt,
                loops,
                id: ++this.intervalIndex,
            });
        }
    }

    setTimeout(fn, timeout) {
        if (fn && timeout) {
            this.intervals.push({
                fn,
                interval: timeout,
                loops: 1,
                calledAt: this.timePassed,
                id: ++this.intervalIndex,
            });
        }
    }

    clearInterval(id) {
        const intervalIdx = this.intervals.findIndex(i => i.id === id);

        if (intervalIdx > -1) {
            this.intervals.splice(intervalIdx, 1);
        }
    }
}