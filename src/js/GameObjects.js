import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';
import AI from './GameObjects/AI';
import Player from './GameObjects/Player';
import Fire from './GameObjects/Fire';
import Unit from './GameObjects/Unit';
import AnimatedGameObject from './GameObjects/AnimatedGameObject';

export {
    AI,
    Player,
    Fire,
    Unit,
    AnimatedGameObject,
};

export default class GameObjectsService extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super();
        this.gameObjects = [];
        this.nextGameObjectId = 0;
        this.scene = scene;
    }

    update(time, deltaTime) {
        this.gameObjects.forEach(gameObject => gameObject.update(time, deltaTime));
    }

    /**
     * @param {Unit} attackingUnit
     */
    attack(attackingUnit) {
        if (attackingUnit.isDead()) {
            return;
        }

        this.scene.intervals.setTimeout(() => {
            const gameTime = this.scene.intervals.getTimePassed();

            if (attackingUnit.isAttackInterrupted(gameTime)) {
                attackingUnit.releaseAttack(gameTime);
                return;
            }

            const attackedUnits = this.gameObjects.filter(gameObject => (
                gameObject !== attackingUnit
                && gameObject instanceof Unit
                && gameObject.isAlive()
                && gameObject.position.distanceTo(attackingUnit.position) < 2
            ));

            attackedUnits.forEach((collisionGameObject) => {
                collisionGameObject.damageTaken({
                    damage: attackingUnit.params.damage,
                    unit: attackingUnit,
                }, gameTime)
            });

            // if (attackedUnits.length) {
            //     this.scene.audio.playSound(attackingUnit.position, 'Attack Soft');
            // }
        }, attackingUnit.getAttackTimeout());
    }

    /**
     * @param {Unit} firingGameObject
     */
    fire(firingGameObject) {
        if (firingGameObject.isDead()) {
            return;
        }

        const createLightCube = left => this.scene.models.createCube({
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
            checkWay: this.scene.colliders.checkWay,
            getCollisions: () => this.gameObjects.filter(gameObject => (
                gameObject instanceof Unit
                && gameObject.isAlive()
                && fireGameObject.params.parent !== gameObject
                && fireGameObject.position.distanceTo(gameObject.position) < 3
            )),
            destroy: () => this.destroyGameObject(fireGameObject),
        }));

        this.scene.intervals.setTimeout(() => this.destroyGameObject(fireGameObject), 2000);

        // this.scene.audio.playSound(firingGameObject.position, 'Lasers');
    }

    /**
     * @param {GameObject} gameObject
     */
    hookGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        gameObject.__game_object_id = this.nextGameObjectId++;

        return gameObject;
    }

    removeAll() {
        while (this.gameObjects.length) {
            this.destroyGameObject(this.gameObjects[0]);
        }
    }

    removeAllExceptPlayer() {
        const getNextNonPlayerIndex = () => this.gameObjects.findIndex(go => go !== this.scene.getPlayer());
        let removeIdx = getNextNonPlayerIndex();

        while (removeIdx > -1) {
            const gameObject = this.gameObjects[removeIdx];
            this.gameObjects.splice(removeIdx, 1);

            this.removeGameObjectFromScene(gameObject);

            removeIdx = getNextNonPlayerIndex();
        }
    }

    /**
     * @param {GameObject} gameObject
     */
    destroyGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);

        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }

        this.removeGameObjectFromScene(gameObject);
    }

    /**
     * @param {GameObject} gameObject
     */
    removeGameObjectFromScene(gameObject) {
        const parent = (gameObject.object && gameObject.object.parent) || this.scene;

        if (parent.remove) {
            parent.remove(gameObject.object);
        } else {
            console.error('Cannot find object parent to remove the object', gameObject);
        }
    }

    getUnits() {
        return this.gameObjects.filter(go => go instanceof Unit);
    }
}

