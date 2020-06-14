import AutoBindMethods from './AutoBindMethods';

export default class Colliders extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.colliders = [];
        this.nextId = 0;
    }

    checkWay(position, gameObject) {
        for(let collider of this.colliders) {
            if (collider.fn(position, gameObject)) {
                return false;
            }
        }

        return true;
    }

    resetColliders() {
        this.colliders = [];
    }

    removeCollider(id) {
        const idx = this.colliders.findIndex(c => c.id === id);

        if (idx > -1) {
            this.colliders.splice(idx, 1);
        }
    }

    addColliderFunction(fn) {
        this.colliders.push({
            id: this.nextId++,
            fn,
        });
    }
}