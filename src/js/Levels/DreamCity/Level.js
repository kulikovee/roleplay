import * as THREE from 'three';
import AbstractLevel from '../AbstractLevel';
import { AI, Fire } from '../../GameObjects';
import Areas from './Areas';

export default class Level extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);

        this.id = 'map';

        this.shadowLightPosition = new THREE.Vector3(25, 50, 25);
        this.lastBadGuyCreated = 0;
        this.environment = this.createEnvironment();
        // this.skybox = this.createSkybox();
        this.ambientLight = this.createAmbientLight();
        this.shadowLight = this.createShadowLight();

        this.scene.add(this.environment);
        // this.scene.add(this.skybox);
        this.scene.add(this.ambientLight);
        this.scene.add(this.shadowLight);

        this.house1Positions = [
            { x: 15, z: 15 },
            { x: -15, z: 15 },
            { x: -15, z: -15 },
            { x: 15, z: -15 },
        ];

        this.respawnPoints = this.house1Positions.map(({ x, z }) => ({
            x: x + 0.63,
            y: 0.1,
            z: z + 4.03,
        }));

        this.elevator = this.createElevator({
            position: { x: -48, y: 100, z: 0 },
            x: 4,
            y: 1,
            z: 4,
        });

        this.nextRespawnPoint = 0;

        const color = 0x000000;
        const near = 10;
        const far = 100;
        this.scene.scene.fog = new THREE.Fog(color, near, far);
        // this.scene.audio.playMusic('Music');

        this.createLevelColliders();
        this.startLevel();
    }

    update() {
        super.update();

        const player = this.scene.getPlayer();

        if (player) {
            this.elevator.update();

            this.shadowLight.position
                .copy(player.position)
                .add(this.shadowLightPosition);

            if (this.shadowLight.target !== player.object) {
                this.shadowLight.target = player.object;
            }
        }
    }

    startLevel() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = this.scene.intervals.setInterval(this.createBadGuyByTimeout, 500);
        this.scene.ui.setRestartButtonVisible(false);
        this.scene.ui.setPause(true);
    }

    restartLevel() {
        this.scene.clearScene();
    }

    stopLevel() {
        this.scene.remove(this.environment);
        // this.scene.remove(this.skybox);
        this.scene.remove(this.ambientLight);
        this.scene.remove(this.shadowLight);
        this.scene.gameObjectsService.removeAllExceptPlayer();
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    createLevelColliders() {
        const isBetween = (v, min, max) => v > min && v < max;

        this.scene.colliders.addColliderFunction((position, gameObject) => {
            const { x, y, z } = position;
            const absX = Math.abs(x);
            const absZ = Math.abs(z);

            if (
                (y < 0.1 && absX < 50 && absZ < 50) // floor 0
                || (((y < (absX - 50) / 1.5) && absX > 50) || ((y < (absZ - 50) / 1.5) && absZ > 50)) // out of floor 0
                || (y < 90 && absX > 96 && absZ > 96) // out of floor 0
                || (isBetween(y, 90, 100) && (absX > 50 || absZ > 50)) // floor 1
                || (isBetween(y, 90, 190) && (absX > 135 || absZ > 135)) // out of floor 1
                || (isBetween(y, 190, 200) && (absX > 50 || absZ > 50)) // floor 2
                || (y > 190 && (absX > 133 || absZ > 133)) // out of floor 2
                || this.elevator.isCarrying(position) // elevator
            ) {
                return true;
            }

            const units = this.scene.units.getAliveUnits();

            for(let unit of units) {
                if (
                    unit !== gameObject
                    && (
                        !(gameObject instanceof Fire)
                        || gameObject.params.parent !== unit
                    )
                    && unit.getCollider(position)
                ) {
                    return true;
                }
            }

            return false;
        });
    }

    createEnvironment() {
        const pivot = new THREE.Object3D();
        pivot.matrixAutoUpdate = false;
        pivot.name = 'Level Environment';

        const treePositions = [
            { x: 0, z: 15 },
            { x: 0, z: -15 },
            { x: 15, z: 0 },
            { x: -15, z: 0 },
        ];

        this.scene.models.loadGLTF({
            baseUrl: './assets/models/environment/enviroment',
            noScene: true,
            castShadow: false,
            callback: object => {
                pivot.add(object.scene);
                object.scene.matrixAutoUpdate = false;
                object.scene.updateMatrix();
            }
        });

        this.scene.models.loadGLTF({
            baseUrl: './assets/models/environment/tree',
            noScene: true,
            receiveShadow: false,
            callback: (loadedModel) => treePositions.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'Tree';
                model.position.set(position.x, 0, position.z);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, z } = model.position;

                this.scene.colliders.addColliderFunction(
                    (position) => Math.abs(position.x - x) < 2 && Math.abs(position.z - z) < 2
                );

                pivot.add(model);
            })
        });

        this.scene.models.loadGLTF({
            baseUrl: './assets/models/environment/house1',
            receiveShadow: false,
            noScene: true,
            callback: (loadedModel) => this.house1Positions.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'House1';
                model.position.set(position.x, 0, position.z);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, z } = model.position;

                this.scene.colliders.addColliderFunction(
                    (position) => Math.abs(position.x - x) < 4 && Math.abs(position.z - z) < 3
                );

                pivot.add(model);
            })
        });

        return pivot;
    }

    createSkybox() {
        const materialArray = ['RT', 'LF', 'UP', 'DN', 'FT', 'BK'].map(function (direction) {
            const url = `./assets/textures/sky-day/skybox${direction}.jpg`;
            return new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(url),
                side: THREE.BackSide,
                fog: false,
            });
        });

        const skyGeometry = new THREE.CubeGeometry(75000, 75000, 75000);
        const skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        return new THREE.Mesh(skyGeometry, skyMaterial);
    }

    createElevator(params) {
        return {
            currentFloor: 1,
            target: 0,
            direction: -1,
            speed: 0.3,
            standTime: 10,
            standAt: this.scene.intervals.getTimePassed(),
            isReleased: () => this.scene.intervals.getTimePassed() - this.elevator.standAt > this.elevator.standTime * 1000,
            isCarrying: ({ x, y, z }) => {
                const { object: { position, scale } } = this.elevator;

                return (
                    Math.abs(x - position.x) < scale.x / 2
                    && Math.abs(z - position.z) < scale.z / 2
                    && (y - position.y < scale.y / 2)
                    // && (y + 1.7) - position.y > -scale.y / 2
                );
            },
            getFloor: () => (
                this.elevator.direction > 0
                    ? (
                        (this.elevator.object.position.y >= 200 && 2)
                        || (this.elevator.object.position.y >= 100 && 1)
                        || 0
                    )
                    : (
                        (this.elevator.object.position.y > 100 && 2)
                        || (this.elevator.object.position.y > 0 && 1)
                        || 0
                    )
            ),
            update: () => {
                if (this.elevator.isReleased()) {
                    const floor = this.elevator.getFloor();

                    if (floor !== this.elevator.currentFloor) {
                        this.elevator.standAt = this.scene.intervals.getTimePassed();
                        this.elevator.currentFloor = floor;

                        if (floor === 2) {
                            this.elevator.direction = -1;
                        } else if (floor === 0) {
                            this.elevator.direction = 1;
                        }

                        this.elevator.target = floor + this.elevator.direction;
                    } else {
                        const getCarryingPosition = unit => ({ ...unit.position, y: unit.position.y - (this.elevator.direction > 0 ? 2 : 0.1) });
                        const carryingUnits = this.scene.gameObjectsService.getUnits().filter(
                            unit => (this.elevator.isCarrying(getCarryingPosition(unit))),
                        );

                        const elevatorAcceleration = this.elevator.speed * this.elevator.direction;
                        carryingUnits.forEach((unit) => { unit.position.y += elevatorAcceleration; });
                        this.elevator.object.position.y += elevatorAcceleration;
                    }
                }
            },
            object: this.scene.models.createCube(params),
        };
    }

    getBadGuys() {
        return this.scene.units.getAliveUnits().filter(unit => unit instanceof AI);
    }

    createBadGuyByTimeout() {
        const { ui: { pause } } = this.scene;
        const player = this.scene.getPlayer();

        if (!player || pause) {
            return;
        }

        const time = this.scene.intervals.getTimePassed(),
            level = player.getLevel(),
            badGuyTimeout = 5000 - level * 500,
            isBadGuyReleased = time - this.lastBadGuyCreated >= badGuyTimeout,
            badGuysCount = this.getBadGuys().length;

        if (badGuysCount < level && isBadGuyReleased) {
            this.lastBadGuyCreated = time;
            this.scene.units.createAI({ position: this.respawnPoints[this.nextRespawnPoint++] });

            if (this.nextRespawnPoint > this.respawnPoints.length - 1) {
                this.nextRespawnPoint = 0;
            }
        }
    }

    getAreas() {
        const areas = Object.values(Areas);

        const generateWaypoints = (width, height, map) => {
            return new Array(width).fill(null).map(
                (null1, x) => new Array(height).fill(null).map(
                    (null2, y) => map(x, y),
                ),
            );
        };

        return areas.map((area) => {
            const result = { ...area };

            result.getWaypoints = () => generateWaypoints(
                area.width,
                area.height,
                (x, y) => {
                    if (
                        // Elevator
                        Math.abs(area.waypointXToWorldX(x) + 48) <= 5
                        && Math.abs(area.waypointYToWorldZ(y)) <= 1
                    ) {
                        return 1;
                    }

                    if (
                        area.id !== 'FLOOR_0' && (
                            // Center hole
                            (
                                Math.abs(area.waypointXToWorldX(x)) < 51
                                && Math.abs(area.waypointYToWorldZ(y)) < 51
                            )
                            || (
                                Math.abs(area.waypointXToWorldX(x)) <= 51
                                && Math.abs(area.waypointYToWorldZ(y)) <= 51
                                && Math.abs(area.waypointXToWorldX(x)) >= 50
                                && Math.abs(area.waypointYToWorldZ(y)) >= 50
                            )
                        )
                    ) {
                        return 0;
                    }

                    if (
                        area.id === 'FLOOR_0'
                        && (
                            // Floor out
                            Math.abs(area.waypointXToWorldX(x)) >= 49
                            || Math.abs(area.waypointYToWorldZ(y)) >= 49
                        )
                    ) {
                        return 1;
                    }

                    return Number(this.checkWayForWaypoint(area.getWorldWaypointByXY(x, y)))
                },
            );

            return result;
        });
    }

    checkWayForWaypoint({ x, y, z }) {
        const checkWay = this.scene.colliders.checkWay;
        const checkNear = (range, diagonal) => (
            checkWay(new THREE.Vector3(x + range, y, z))
            && (checkWay(new THREE.Vector3(x - range, y, z)))
            && (checkWay(new THREE.Vector3(x, y, z + range)))
            && (checkWay(new THREE.Vector3(x, y, z - range)))
            && (
                !diagonal || (
                    checkWay(new THREE.Vector3(x + range, y, z + range))
                    && checkWay(new THREE.Vector3(x - range, y, z - range))
                    && checkWay(new THREE.Vector3(x - range, y, z + range))
                    && checkWay(new THREE.Vector3(x + range, y, z - range))
                )
            )
        );

        return (
            checkWay(new THREE.Vector3(x, y, z))
            && checkNear(1, true)
            && checkNear(2)
        );
    }
}
