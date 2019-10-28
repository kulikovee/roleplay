export default class GameObject {
    constructor(params = {}) {
        this.params = params;
        this.object = params.object;

        if (params.object) {
            this.position = params.object.position;
            this.rotation = params.object.rotation;
        }

        this.events = {};

        this.update = this.update.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
    }

    update() {
    }

    dispatchEvent(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(...args));
        }
    }

    addEventListener(eventName, callback) {
        if (typeof callback === 'function') {
            if (this.events[eventName]) {
                this[eventName].push(callback);
            } else {
                this.events[eventName] = [callback];
            }
        }
    }
}