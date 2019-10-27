export default class GameObject {
    constructor(object, params = {}) {
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                this[key] = params[key];
            }
        }

        this.object = object;
        this.position = object.position;
        this.rotation = object.rotation;
        this.events = {};

        this.update = this.update.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    update() {
        // Override this
    }

    dispatchEvent(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callback) {
                callback(...args);
            });
        }
    }

    addEventListener(eventName, callback) {
        if (typeof callback === "function") {
            if (this.events[eventName]) {
                this[eventName].push(callback);
            } else {
                this.events[eventName] = [callback];
            }
        }
    }

    destroy() {
        this.gameLogicService.destroyGameObject(this);
    }
}