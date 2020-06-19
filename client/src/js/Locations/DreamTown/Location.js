import AbstractLocation from '../AbstractLocation';
import { Player } from '../../GameObjects';
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
         onLoad: () => {
            this.scene.ui.setLoading(false);

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

            if (this.onLoad) {
               this.onLoad();
            }
         }
      });
      this.environmentMeshes = [];

      const raycastFar = 500;
      this.raycaster = {
         raycaster: new THREE.Raycaster(),
         origin: new Vector3(),
         target: new Vector3(),
         direction: new THREE.Vector3(),
         raycastFar,
         intersectTo: -raycastFar / 2,
         cache: {},
      };
      this.raycaster.raycaster.far = this.raycaster.raycastFar;

      this.ambientLight = this.createAmbientLight();
      this.shadowLight = this.createShadowLight();

      this.scene.add(this.environment);
      this.scene.add(this.ambientLight);
      this.scene.add(this.shadowLight);

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

      this.scene.intervals.setInterval(() => {
         this.raycaster.cache = {};
      }, 60000);
   }

   update() {
      super.update();

      const player = this.scene.getPlayer();

      if (player) {
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

         const createSwordItem = () => (
            this.scene.intervals.setTimeout(() => {
               const itemHealPosition = new THREE.Vector3(-26.5, 0, 102);

               const item = this.scene.gameObjectsService.createItem({
                  model: 'item-sword',
                  name: 'Steel Sword',
                  type: 'One Handed',
                  boneName: 'Left_Hand',
                  attachModelName: 'sword1',
                  effects: [{
                     damage: +25,
                  }],
                  position: itemHealPosition,
                  canPickup: (unit) => (
                     !unit.params.equippedItems
                     || !unit.params.equippedItems.leftHand
                     || unit.params.equippedItems.leftHand.name !== 'Steel Sword'
                  ),
                  onPickup: (unit) => {
                     const previousWeapon = (
                        unit.params.equippedItems
                        && unit.params.equippedItems.leftHand
                     );

                     if (previousWeapon) {
                        // previousWeapon.object.parent.remove(previousWeapon.object);
                     }

                     unit.params.equippedItems.leftHand = item;

                     this.scene.gameObjectsService.attachItem(unit, item);

                     createSwordItem();
                  },
               });
            }, 10000)
         );

         createHealItem();
         createSwordItem();
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

      const getGoatsParams = (level, position, rotation, name) => getAIParams({
         level,
         position,
         rotation,
         fraction: 'goats',
         name: name || (
              level <= 10 ? 'Goat Warrior'
            : level <= 20 ? 'Goat Elite'
            : level <= 35 ?  'Goat Commando'
            : 'Goat Destroyer'
         ),
      });

      const getFriendlyParams = (level, position, rotation, params = {}) => getAIParams({
         level, position, rotation, fraction: 'friendly', name: 'Friendly Citizen', ...params
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

         getGoatsParams(99, { x: 101, y: 155, z: 113 }, { y: 0.3 }, 'God of Goats'),

         getFriendlyParams(10, { x: -25, y: 1, z: 108 }, { y: -1.53 }, { name: 'Siltent Bob' }),
         getFriendlyParams(2, { x: -69, y: 0, z: 117 }, { y: 0.13 }, { name: 'Talking John' }),
         getFriendlyParams(3, { x: -69, y: 0, z: 119 }, { y: 3.1 }, { name: 'Talking Ien' }),
         getFriendlyParams(8, { x: -48, y: 6, z: 84 }, { y: 2.8 }, { name: 'Warlike Ken' }),
         getFriendlyParams(3, { x: -80, y: 0, z: 97 }, { y: 1.1 }, { name: 'Scarring Dominic' }),
         getFriendlyParams(3, { x: -33, y: 0, z: 137 }, { y: 2.8 }, { name: 'Arrogant Glen' }),
      ].forEach(this.scene.units.createAI);
   }

   createLocationColliders() {
      this.scene.colliders.addColliderFunction((position, gameObject) => {
         const { x, y, z } = position;

         if (!this.environmentMeshes.length) {
            return true;
         }

         const environmentY = this.getEnvironmentY(position);


         return environmentY === this.raycaster.intersectTo || y < environmentY;
      });
   }

   getEnvironmentY({ x, z }) {
      const { intersectTo } = this.raycaster;

      if (!this.environmentMeshes.length) {
         return intersectTo;
      }

      const raycastCacheKey = `${Math.round(x * 100) / 100}, 0, ${Math.round(z * 100) / 100}`;
      const isCache = typeof this.raycaster.cache[raycastCacheKey] === 'number';

      if (isCache) {
         return this.raycaster.cache[raycastCacheKey];
      }

      const {
         raycastFar,
         direction,
         origin,
         target,
         raycaster,
      } = this.raycaster;

      origin.set(x, raycastFar / 2, z);
      target.set(x, -raycastFar / 2, z);
      raycaster.set(origin, direction.subVectors(target, origin).normalize());
      const intersects = raycaster.intersectObjects(this.environmentMeshes);
      const environmentY = Math.max(intersectTo, ...intersects.map(i => raycastFar / 2 - i.distance));

      if (!isCache && environmentY !== this.raycaster.intersectTo) {
         this.raycaster.cache[raycastCacheKey] = environmentY;
      }

      return environmentY;
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
