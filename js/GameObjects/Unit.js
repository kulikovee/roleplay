import MovingGameObject from './MovingGameObject.js';

export default class Unit extends MovingGameObject {
    constructor(object, params = {}) {
        super(object, {
            hp: 100,
            damage: 10,
            ...params,
        });

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
        const fireParent = fire && fire.parent;

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