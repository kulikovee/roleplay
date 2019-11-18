import AI from './GameObjects/AI.js';
import Player from './GameObjects/Player.js';
import Fire from './GameObjects/Fire.js';
import Unit from './GameObjects/Unit.js';

export {
    AI,
    Player,
    Fire,
    Unit,
};

export default class GameObjectsService {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.gameObjects = [];
        this.scene = scene;

        this.update = this.update.bind(this);
        this.fire = this.fire.bind(this);
        this.hookGameObject = this.hookGameObject.bind(this);
        this.removeAllGameObjects = this.removeAllGameObjects.bind(this);
        this.destroyGameObject = this.destroyGameObject.bind(this);
    }

    update() {
        this.gameObjects.forEach(gameObject => gameObject.update());
    }

    /**
     * @param {THREE.Object3D} firingGameObject
     */
    fire(firingGameObject) {
        const createLightCube = left => this.scene.createCube({
            x: 0.02,
            y: 0.02,
            z: 0.3,
            emissive: '#ff0000',
            position: new THREE.Vector3(0.05 - Number(left) * 0.1, 0, 0),
            noScene: true,
        });

        const object = new THREE.Object3D();

        object.position.copy(firingGameObject.getFireInitialPosition());
        object.quaternion.copy(firingGameObject.getFireInitialRotation());

        object.add(createLightCube(true));
        object.add(createLightCube(false));

        this.scene.add(object);

        const fireGameObject = this.hookGameObject(new Fire({
            object,
            throttling: new THREE.Vector3(1, 1, 1),
            speed: firingGameObject.params.fireFlySpeed,
            damage: firingGameObject.params.damage,
            parent: firingGameObject,
            getCollisions: () => this.gameObjects.filter(gameObject => (
                gameObject instanceof Unit
                && fireGameObject.params.parent !== gameObject
                && fireGameObject.position.distanceTo(gameObject.position) < 3
            )),
            destroy: () => this.destroyGameObject(fireGameObject),
        }));

        setTimeout(() => this.destroyGameObject(fireGameObject), 2000);
    }

    /**
     * @param {THREE.Object3D} gameObject
     */
    hookGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        return gameObject;
    }

    removeAllGameObjects() {
        while (this.gameObjects.length) {
            this.destroyGameObject(this.gameObjects[0]);
        }
    }

    removeAllGameObjectsExceptPlayer() {
        while (this.gameObjects.length > 1) {
            const removeIdx = Number(this.gameObjects[0] instanceof Player);
            this.destroyGameObject(this.gameObjects[removeIdx]);
        }
    }

    /**
     * @param {THREE.Object3D} gameObject
     */
    destroyGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);

        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }

        this.scene.remove(gameObject.object);
    }
}

