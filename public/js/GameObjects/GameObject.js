import AutoBindMethods from '../AutoBindMethods.js';

export default class GameObject extends AutoBindMethods {
    constructor(params = {}) {
        super();
        this.params = params;
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

    getChildPosition(name) {
        const child = this.getChildByName(name);
        child.updateMatrixWorld(true);

        return new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
    }

    getChildRotation(name) {
        const child = this.getChildByName(name);
        child.updateMatrixWorld(true);

        let target = new THREE.Quaternion();
        child.getWorldQuaternion(target);

        return target;
    }
}