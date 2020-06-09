import AutoBindMethods from '../AutoBindMethods';

export default class GameObject extends AutoBindMethods {
    constructor(params = {}) {
        super();
        this.params = { ...params };
        this.object = params.object;

        if (params.object) {
            this.position = params.object.position;
            this.rotation = params.object.rotation;
        }

        this.events = {};
    }

    update() {
    }

    /**
     * @param {string} eventName
     * @param {object[]} args
     */
    dispatchEvent(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(...args));
        }
    }

    /**
     * @param {string} eventName
     * @param {function} callback
     */
    addEventListener(eventName, callback) {
        if (typeof callback === 'function') {
            if (this.events[eventName]) {
                this.events[eventName].push(callback);
            } else {
                this.events[eventName] = [callback];
            }
        }
    }

    getChildByName(name) {
        return this.object.getObjectByName(name, true);
    }

    getChildDirection(arg, vector = new THREE.Vector3(0, 0, 1)) {
        const child = typeof arg === 'string'
            ? this.getChildByName(arg)
            : arg;

        return vector.applyQuaternion(this.getChildRotation(child));
    }

    getChildPosition(arg) {
        const child = typeof arg === 'string'
            ? this.getChildByName(arg)
            : arg;

        return new THREE.Vector3().setFromMatrixPosition((child || this.object).matrixWorld);
    }

    getChildRotation(arg) {
        const child = typeof arg === 'string'
            ? this.getChildByName(arg)
            : arg;

        let target = new THREE.Quaternion();
        (child || this.object).getWorldQuaternion(target);

        return target;
    }
}