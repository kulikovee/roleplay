import * as THREE from 'three';
import AbstractLevel from '../AbstractLevel';
import { AI, Fire } from '../../GameObjects';
import Elevator from './Elevator';
import { createEnvironment } from './Enviroment';
import Areas from './Areas';

export default class Level extends AbstractLevel {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super(scene);
        this.id = 'dream-town';

        this.shadowLightPosition = new THREE.Vector3(25, 50, 25);

        this.units = [
            { position: { x: -15 + 0.63, y: 0.2, z: -15 + 4.03 }, fraction: 'goats', level: 4 },
            { position: { x: -15 + 1.63, y: 0.2, z: -15 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: 15 + 0.63, y: 0.2, z: -15 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 15 + 1.63, y: 0.2, z: -15 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: -15 + 0.63, y: 0.2, z: 15 + 4.03 }, fraction: 'goats', level: 5 },
            { position: { x: -15 + 1.63, y: 0.2, z: 15 + 4.03 }, fraction: 'friendly', level: 3 },

            { position: { x: 15 + 0.63, y: 0.2, z: 15 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 15 + 1.63, y: 0.2, z: 15 + 4.03 }, fraction: 'friendly', level: 2 },


            { position: { x: -75 + 0.63, y: 100.2, z: -75 + 4.03 }, fraction: 'goats', level: 4 },
            { position: { x: -75 + 1.63, y: 100.2, z: -75 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: 75 + 0.63, y: 100.2, z: -75 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 75 + 1.63, y: 100.2, z: -75 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: -75 + 0.63, y: 100.2, z: 75 + 4.03 }, fraction: 'goats', level: 5 },
            { position: { x: -75 + 1.63, y: 100.2, z: 75 + 4.03 }, fraction: 'friendly', level: 3 },

            { position: { x: 75 + 0.63, y: 100.2, z: 75 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 75 + 1.63, y: 100.2, z: 75 + 4.03 }, fraction: 'friendly', level: 2 },


            { position: { x: -75 + 0.63, y: 200.2, z: -75 + 4.03 }, fraction: 'goats', level: 4 },
            { position: { x: -75 + 1.63, y: 200.2, z: -75 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: 75 + 0.63, y: 200.2, z: -75 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 75 + 1.63, y: 200.2, z: -75 + 4.03 }, fraction: 'friendly', level: 1 },

            { position: { x: -75 + 0.63, y: 200.2, z: 75 + 4.03 }, fraction: 'goats', level: 5 },
            { position: { x: -75 + 1.63, y: 200.2, z: 75 + 4.03 }, fraction: 'friendly', level: 3 },

            { position: { x: 75 + 0.63, y: 200.2, z: 75 + 4.03 }, fraction: 'goats', level: 3 },
            { position: { x: 75 + 1.63, y: 200.2, z: 75 + 4.03 }, fraction: 'friendly', level: 2 },
        ].forEach(this.scene.units.createAI);

        this.scene.ui.setLoading(true);
        this.scene.ui.setPause(true);

        this.environment = createEnvironment({
            load: this.scene.models.loadGLTF,
            addColliderFunction: this.scene.colliders.addColliderFunction,
            trees: [
                { x: 0, y: 0, z: 15 },
                { x: 0, y: 0, z: -15 },
                { x: 15, y: 0, z: 0 },
                { x: -15, y: 0, z: 0 },
            ],
            houses: [
                { x: 15, y: 0, z: 15 },
                { x: -15, y: 0, z: 15 },
                { x: -15, y: 0, z: -15 },
                { x: 15, y: 0, z: -15 },

                { x: 75, y: 100, z: 75 },
                { x: -75, y: 100, z: 75 },
                { x: -75, y: 100, z: -75 },
                { x: 75, y: 100, z: -75 },

                { x: 75, y: 200, z: 75 },
                { x: -75, y: 200, z: 75 },
                { x: -75, y: 200, z: -75 },
                { x: 75, y: 200, z: -75 },
            ],
            onLoad: () => {
                this.scene.ui.setLoading(false);
                this.scene.ui.setPause(false);
                this.scene.notify('Dream Town');
                this.startLevel();
            }
        });

        this.ambientLight = this.createAmbientLight();
        this.shadowLight = this.createShadowLight();

        this.scene.add(this.environment);
        this.scene.add(this.ambientLight);
        this.scene.add(this.shadowLight);

        this.elevator = new Elevator(scene, {
            position: { x: -48, y: 100, z: 0 },
            x: 4,
            y: 1,
            z: 4,
        });

        const color = 0x000000;
        const near = 10;
        const far = 100;
        this.scene.scene.fog = new THREE.Fog(color, near, far);

        this.createLevelColliders();
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

        this.scene.ui.setRestartButtonVisible(false);
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
                || this.elevator.isCarrying(position)
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
                        Math.abs(area.waypointXToWorldX(x) - this.elevator.params.position.x) <= 5
                        && Math.abs(area.waypointYToWorldZ(y) - this.elevator.params.position.z) <= 1
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
