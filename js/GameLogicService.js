import { Fire } from './GameObjects.js';

export default class GameLogicService {
    constructor(scene) {
        this.gameObjects = [];
        this.scene = scene;

        this.update = this.update.bind(this);
        this.fire = this.fire.bind(this);
        this.removeAllGameObjects = this.removeAllGameObjects.bind(this);
        this.createGameObject = this.createGameObject.bind(this);
        this.destroyGameObject = this.destroyGameObject.bind(this);
    }

    update() {
        this.gameObjects.forEach((gameObject) => {
            gameObject.update();

            if (!(gameObject instanceof Fire)) {
                this.gameObjects
                    .filter(go => (go instanceof Fire))
                    .forEach((fireObject) => {
                        if (
                            fireObject.parent.object.uuid !== gameObject.object.uuid
                            && fireObject.object.position.distanceTo(gameObject.object.position) < 3
                        ) {
                            gameObject.attacked({
                                damage: fireObject.damage,
                                parent: fireObject.parent
                            });

                            this.destroyGameObject(fireObject);
                        }
                    });
            }
        });
    }

    fire(firingGameObject) {
        const fireGameObject = this.createGameObject(
            Fire,
            this.scene.createCube({
                x: 0.2,
                y: 0.2,
                z: 3,
                emissive: "#aaffaa",
                position: firingGameObject.object.position
                    .clone()
                    .add(firingGameObject.getForward().multiplyScalar(3)),
                rotation: firingGameObject.object.rotation
            }),
            firingGameObject.fireFlySpeed,
            firingGameObject.damage,
            firingGameObject
        );

        setTimeout(() => this.destroyGameObject(fireGameObject), 2000);
    }

    removeAllGameObjects() {
        while (this.gameObjects.length) {
            this.destroyGameObject(this.gameObjects[0]);
        }
        ;
    }

    createGameObject(gameObjectClass, ...args) {
        const gameObject = new gameObjectClass(...args);
        gameObject.gameLogicService = this;
        this.gameObjects.push(gameObject);

        return gameObject;
    }

    destroyGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);

        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }

        this.scene.scene.remove(gameObject.object);
    }
}
