export default class AutoBindMethods {
    constructor() {
        let functionNames = [];
        let obj = Object.getPrototypeOf(this);

        while (obj) {
            if (obj === Object.prototype || obj === AutoBindMethods.prototype) {
                obj = Object.getPrototypeOf(obj);
                continue;
            }

            functionNames = functionNames.concat(
                Object.getOwnPropertyNames(obj).filter(name => (
                    name !== 'constructor'
                    && functionNames.indexOf(name) === -1
                    && typeof this[name] === 'function'
                ))
            );

            obj = Object.getPrototypeOf(obj);
        }

        for (let functionName of functionNames) {
            this[functionName] = this[functionName].bind(this);
        }
    }
}

