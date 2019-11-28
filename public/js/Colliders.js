export default class Colliders {
    constructor(scene) {
        this.resetColliders = this.resetColliders.bind(this);
        this.removeCollider = this.removeCollider.bind(this);
        this.addColliderFunction = this.addColliderFunction.bind(this);
        this.checkWay = this.checkWay.bind(this);

        this.scene = scene;
        this.colliders = [];
        this.nextId = 0;
    }

    checkWay(position) {
        for(let collider of this.colliders) {
            if (collider.fn(position)) {
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