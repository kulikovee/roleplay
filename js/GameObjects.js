class GameObject {
    constructor(object) {
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


class MovingGameObject extends GameObject {
    constructor(object, speed, throttling) {
        super(object);
        this.throttling = throttling || 0.95;
        this.speed = speed || 0.01;
        this.acceleration = new THREE.Vector3();

        this.update = this.update.bind(this);
        this.getUp = this.getUp.bind(this);
        this.getLeft = this.getLeft.bind(this);
        this.getForward = this.getForward.bind(this);
        this.getDirection = this.getDirection.bind(this);
        this.moveObjectToPosition = this.moveObjectToPosition.bind(this);
    }

    update() {
        GameObject.prototype.update.call(this);
        this.position.add(this.acceleration.multiplyScalar(this.throttling));
    }

    getUp() {
        return this.getDirection(new THREE.Vector3(0, 1, 0));
    }

    getLeft() {
        return this.getDirection(new THREE.Vector3(1, 0, 0));
    }

    getForward() {
        var vector = new THREE.Vector3();
        this.object.getWorldDirection(vector);
        return vector;
    }

    getDirection(direction) {
        var matrix = new THREE.Matrix4();
        matrix.extractRotation(this.object.matrix);
        direction.applyMatrix4(matrix);

        return direction;
    }

    moveObjectToPosition(position, speed) {
        if (this.object && this.object.position && position) {
            this.object.position.sub(
                this.object.position
                    .clone()
                    .sub(position)
                    .multiplyScalar(1 / (speed || 1))
            );
        }
    }
}


class Unit extends MovingGameObject {
    constructor(object, params) {
        params = params || {};
        super(object, params.speed, params.throttling);

        this.hp = params.hp || 100;
        this.damage = params.damage || 10;

        ["onAttacked", "onDead", "onKill", "onAttack"].forEach((eventName) => {
            if (typeof params[eventName] === "function") {
                this.addEventListener(eventName, params[eventName]);
            }
        });

        this.update = this.update.bind(this);
        this.attacked = this.attacked.bind(this);
    }

    attacked(fire) {
        this.hp -= fire.damage;
        var fireParent = fire && fire.parent;

        this.dispatchEvent("onAttacked", fireParent);
        if (fireParent) {
            fireParent.dispatchEvent("onAttack", this);
        }

        if (this.hp <= 0) {
            this.dispatchEvent("onDead", fireParent);

            if (fireParent) {
                fireParent.dispatchEvent("onKill", this);
            }

            this.destroy();
        }
    }
}

class Fire extends MovingGameObject {
    constructor(object, speed, damage, parent) {
        super(object, speed, 1);
        this.parent = parent;
        this.damage = damage;

        this.acceleration.add(
            this.getForward().multiplyScalar(this.speed)
        );
    }
}


class FiringUnit extends Unit {
    constructor(object, params) {
        params = params || {};
        super(object, params);

        this.fireRate = params.fireRate || 40;
        this.fireFlySpeed = params.fireFlySpeed || 3;
        this.latestFire = Date.now();

        this.fire = this.fire.bind(this);
    }

    fire() {
        if (Date.now() - this.latestFire >= this.fireRate) {
            this.latestFire = Date.now();
        } else {
            return false;
        }

        this.gameLogicService.fire(this);
    }
}


class AI extends FiringUnit {
    constructor(object, target, params) {
        params = params || {};
        super(
            object,
            {
                ...params,
                speed: params.speed || 0.05,
                fireRate: 500,
                damage: params.damage || 10,
                hp: params.hp || 100,
            }
        );

        this.target = target;
        this.bounty = this.hp / 4 + this.damage + this.speed * 300;
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);
        this.object.lookAt(this.target.position);
        this.fire();
        if (this.object.position.distanceTo(this.target.position) > 50) {
            this.acceleration.add(this.getForward().multiplyScalar(this.speed));
        }
    }
}


class Player extends FiringUnit {
    constructor(object, input, params) {
        params = params || {};

        super(
            object,
            {
                ...params,
                speed: params.speed || 0.9,
                fireRate: 100,
                damage: params.damage || 50,
                hp: params.hp || 100
            }
        );

        this.input = input;
        this.kills = 0;
        this.score = params.score || 0;
        this.update = this.update.bind(this);
    }

    update() {
        FiringUnit.prototype.update.call(this);

        if (this.input.mouseLeft) {
            this.fire();
        }

        if (this.input.look.horizontal) {
            this.object.rotateOnWorldAxis(
                new THREE.Vector3(0, 1, 0),
                -this.input.look.horizontal / 1000
            );
        }

        this.object.rotateX(this.input.look.vertical / 500);
        this.acceleration.add(
            this.getMovingDirection().multiplyScalar(this.speed)
        );
    }

    getMovingDirection() {
        return this.getDirection(
            new THREE.Vector3(-this.input.horizontal, this.input.space, this.input.vertical)
        );
    }
}

export {
    GameObject,
    MovingGameObject,
    AI,
    Player,
    FiringUnit,
    Unit,
    Fire,
};

export default GameObject;
