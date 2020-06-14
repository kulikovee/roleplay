import AbstractLocation from '../AbstractLocation';
import { Player, Fire } from '../../GameObjects';
import Elevator from './Elevator';
import { createEnvironment } from './Environment';
import Areas from './Areas';
import { Vector3 } from "three";

export default class Location extends AbstractLocation {
   /**
    * @param {Scene} scene
    */
   constructor(scene) {
      super(scene);
      this.id = 'dream-town';

      this.shadowLightPosition = new THREE.Vector3(25, 50, 25);

      this.scene.ui.setLoading(true);
      this.scene.ui.setPause(true);

      this.environment = createEnvironment({
         load: this.scene.models.loadGLTF,
         addColliderFunction: this.scene.colliders.addColliderFunction,
         trees: [
            // { x: 0, y: 0, z: 15, ry: 0 },
            // { x: 0, y: -0.75, z: -15, ry: Math.PI * 0.7 },
            // { x: 26, y: 0, z: 0, ry: Math.PI * 1.5 },
            // { x: -15, y: -1, z: 0, ry: Math.PI * 0.3 },
            //
            // { x: -40, y: -2, z: 15, ry: Math.PI * 0.3 },
            // { x: -40, y: -3, z: -15, ry: Math.PI * 0.5 },
            // { x: -55, y: -3, z: 20, ry: Math.PI * 0.7 },
            // { x: -55, y: -4.5, z: -20, ry: Math.PI * 1.3 },
            //
            // { x: -45, y: -4.5, z: -35, ry: Math.PI * 1.3 },
            // { x: -45, y: -2, z: 40, ry: Math.PI * 1.5 },
            //
            // { x: -5, y: 0, z: 75, ry: Math.PI * 0.4 },
            // { x: -20, y: 0, z: 90, ry: Math.PI * 0.3 },
         ],
         houses: [
            // { x: 0, y: -2.2, z: -50, ry: -Math.PI },
            // { x: 16, y: -3.8, z: -80, ry: -Math.PI / 2 },
            // { x: 60, y: -4, z: -50, ry: -Math.PI },
            // { x: 71, y: -4, z: -80, ry: -Math.PI / 2 },
            // { x: -60, y: -5.3, z: -50, ry: -Math.PI },
            // { x: -54, y: -4, z: -80, ry: -Math.PI / 2 },
         ],
         onLoad: () => {
            this.scene.ui.setLoading(false);
            this.scene.ui.setPause(false);

            this.scene.notify('Smoke Island');

            const getChildrenFlat = objects => [].concat(...objects.map(
               obj => obj.children
                  ? [obj, ...getChildrenFlat(obj.children)]
                  : [obj]
            ));
            const environment = [this.scene.scene.children.find(c => c.name === 'LEVEL_ENVIRONMENT')];
            this.environmentMeshes = getChildrenFlat(environment).filter(obj => obj.type === 'Mesh');

            this.startLocation();
            this.createLocationColliders();
            this.scene.pathFinder.rebuildAreas();
            this.isLoaded = true;
         }
      });
      this.environmentMeshes = [];

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

      const color = 0xffffff;
      const near = 10;
      const far = 250;
      this.scene.scene.fog = new THREE.Fog(color, near, far);

      this.scene.intervals.setInterval(() => {
         this.scene.units.getAliveUnits().forEach((unit) => {
            if (unit.position.y < -100) {
               unit.die();
            }
         });
      }, 1000);
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

   reviveHero() {
      const player = this.scene.getPlayer();
      player.params.hp = player.params.hpMax / 2;
      player.position.set(-80, 4, 130);
      player.animationState.isDie = false;
      this.scene.particles.createEffect({
         effect: 'level-up/level-up',
         scale: 1.5,
         attachTo: player.object,
      });
   }

   afterClear() {
      this.scene.units.createPlayer({
         /**
          * @param {Player} player
          */
         onCreate: (player) => {
            this.scene.camera.player = player;
            this.scene.ui.updatePlayerParams();
            player.position.set(-80, 4, 130);
         },
         onDie: () => window.setTimeout(() => {
            this.scene.ui.setPause(true);
         }, 2500),
         onKill: dyingUnit => this.onKill(dyingUnit, this.scene.getPlayer()),
         onDamageTaken: () => this.scene.ui.updatePlayerParams(),
         onLocationUp: () => this.scene.ui.updatePlayerParams(),
      });

      this.createInteractiveGameObjects();
   }

   onKill(dyingUnit, killingUnit) {
      this.scene.units.getAliveUnits()
         .filter(unit => (
            !unit.isEnemy(killingUnit)
            && unit.addExperience
            && unit.position.distanceTo(dyingUnit.position) < 40
         ))
         .forEach(unit => unit.addExperience(dyingUnit.params.bounty / 2));

      if (killingUnit.addExperience) {
         killingUnit.addExperience(dyingUnit.params.bounty / 2);
      }

      if (killingUnit.addMoney) {
         killingUnit.addMoney(dyingUnit.params.bounty);
      }
   }

   startLocation() {
      if (this.interval) {
         clearInterval(this.interval);
      }
   }

   restartLocation() {
      this.scene.clearScene();
   }

   stopLocation() {
      this.scene.remove(this.environment);
      // this.scene.remove(this.skybox);
      this.scene.remove(this.ambientLight);
      this.scene.remove(this.shadowLight);
      this.scene.gameObjectsService.removeAllExceptPlayer();
      if (this.interval) {
         clearInterval(this.interval);
      }
   }

   createInteractiveGameObjects(skipItemsCreation) {
      if (!skipItemsCreation) {
         const createHealItem = () => (
            this.scene.intervals.setTimeout(() => {
               const itemHealPosition = new THREE.Vector3(-52.5, -1.6, 117);

               this.scene.gameObjectsService.createItem({
                  model: 'item-heal',
                  position: itemHealPosition,
                  canPickup: (unit) => (unit.getMaxHP() - unit.getHP() > 0),
                  onPickup: (unit) => {
                     unit.addHP(Math.round(unit.params.hpMax * 0.25));
                     createHealItem();
                  },
               });
            }, 10000)
         );

         createHealItem();
      }

      const getAIParams = ({ level, ...params }) => {
         return {
            ...params,
            level,
            scale: 1 + (
               level <= 20
                  ? level / 20
                  : 1 + level / 40
            ),
            onDie: () => this.scene.units.createAI(getAIParams({
               ...params,
               level: level + 1 + Math.round(Math.random() * level),
            })),
         };
      };

      const getGoatsParams = (level, position) => getAIParams({
         level,
         position,
         fraction: 'goats',
         name: level <= 10
            ? 'Goat Warrior'
            : (level <= 20 ? 'Goat Elite' : 'Goat Destroyer'),
      });

      const getFriendlyParams = (level, position, rotation) => getAIParams({
         level, position, rotation, fraction: 'friendly', name: 'Friendly Citizen',
      });

      this.units = [
         getGoatsParams(25, { x: -210, y: 3, z: 15 }),
         getGoatsParams(15, { x: -210, y: 3, z: 30 }),
         getGoatsParams(15, { x: -195, y: 3, z: 15 }),

         getGoatsParams(5, { x: -130, y: 3, z: -1.5 }),
         getGoatsParams(1, { x: -117, y: 3, z: -1 }),
         getGoatsParams(1, { x: -120, y: 3, z: -5 }),

         getGoatsParams(1, { x: -88, y: 3, z: 50 }),
         getGoatsParams(1, { x: -86, y: 3, z: 68 }),

         getGoatsParams(3, { x: -145, y: 6, z: 103 }),
         getGoatsParams(1, { x: -147, y: 6, z: 105 }),

         getGoatsParams(1, { x: -33, y: 6, z: -1 }),

         // getFriendlyParams(5, { x: -10, y: 2, z: 70 }, { y: Math.PI }),
         // getFriendlyParams(5, { x: -10 - 3.5, y: 2, z: 60 }, { y: Math.PI / 2 }),
         // getFriendlyParams(5, { x: -10 + 3.5, y: 2, z: 60 }, { y: -Math.PI / 2 }),
      ].forEach(this.scene.units.createAI);
   }

   createLocationColliders() {
      // const isBetween = (v, min, max) => v > min && v < max;
      const raycaster = new THREE.Raycaster();
      const origin = new Vector3();
      const target = new Vector3();
      const direction = new THREE.Vector3();
      const raycastFar = 500;
      raycaster.far = raycastFar;

      this.scene.colliders.addColliderFunction((position, gameObject) => {
         const { x, y, z } = position;

         if (!this.environmentMeshes.length) {
            return true;
         }

         origin.set(x, raycastFar / 2, z);
         target.set(x, -raycastFar / 2, z);
         raycaster.set(origin, direction.subVectors(target, origin).normalize());

         const intersectTo = -raycastFar / 2;
         const intersects = raycaster.intersectObjects(this.environmentMeshes);
         const environmentY = Math.max(intersectTo, ...intersects.map(i => raycastFar / 2 - i.distance + 0.08));

         if (environmentY === intersectTo) {
            return true;
         }

         if (y < environmentY || this.elevator.isCarrying(position)) {
            return true;
         }

         // TODO: Check if we need units colliders
         // const units = this.scene.units.getAliveUnits();
         //
         // for(let unit of units) {
         //     if (
         //         unit !== gameObject
         //         && (
         //             !(gameObject instanceof Fire)
         //             || gameObject.params.parent !== unit
         //         )
         //         && unit.getCollider(position)
         //     ) {
         //         return true;
         //     }
         // }


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
               // if (
               //    // Elevator
               //    Math.abs(area.waypointXToWorldX(x) - this.elevator.params.position.x) <= 5
               //    && Math.abs(area.waypointYToWorldZ(y) - this.elevator.params.position.z) <= 1
               // ) {
               //    return 1;
               // }

               // if (
               //    area.id !== 'FLOOR_0' && (
               //       // Center hole
               //       (
               //          Math.abs(area.waypointXToWorldX(x)) < 51
               //          && Math.abs(area.waypointYToWorldZ(y)) < 51
               //       )
               //       || (
               //          Math.abs(area.waypointXToWorldX(x)) <= 51
               //          && Math.abs(area.waypointYToWorldZ(y)) <= 51
               //          && Math.abs(area.waypointXToWorldX(x)) >= 50
               //          && Math.abs(area.waypointYToWorldZ(y)) >= 50
               //       )
               //    )
               // ) {
               //    return 0;
               // }

               // if (
               //    area.id === 'FLOOR_0'
               //    && (
               //       // Floor out
               //       Math.abs(area.waypointXToWorldX(x)) >= 49
               //       || Math.abs(area.waypointYToWorldZ(y)) >= 49
               //    )
               // ) {
               //    return 1;
               // }

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
