exports.unitToNetwork = (unit, connectionId, locationName) => {
   if (unit) {
      const unitRotation = unit.object.rotation.toVector3();

      if (!unit.params.unitNetworkId) {
         const getRandomString = () => Math.random().toString(36).substr(2);
         unit.params.unitNetworkId = getRandomString() + getRandomString();
      }

      const unitNetworkId = unit.params.unitNetworkId;
      const {
         isRunning,
         isAttack,
      } = unit;
      const {
         hp,
         hpMax,
         acceleration,
         damage,
         fireDamage,
         level,
         experience,
         fraction,
         name,
         speed,
         unspentTalents,
         money,
         equippedItems,
      } = unit.params;

      const {
         vertical,
         horizontal,
         attack1,
         attack2,
      } = unit.params.input || {};

      const vectorToObject = (vector, eps = 1000) => ({
         x: Math.round(vector.x * eps) / eps,
         y: Math.round(vector.y * eps) / eps,
         z: Math.round(vector.z * eps) / eps,
      });

      const isPostponedAttack = unit.params.__network_last_sent_attack1 < unit.latestAttackTimestamp;
      const isPostponedFire = typeof unit.params.__network_last_sent_attack2 === 'number' && unit.params.__network_last_sent_attack2 < unit.latestFire;

      unit.params.__network_last_sent_attack1 = unit.latestAttackTimestamp;
      unit.params.__network_last_sent_attack2 = unit.latestFire;

      return ({
         type: unit.params.type,
         locationName,
         animationState: unit.animationState,
         isRunning,
         isAttack,
         position: vectorToObject(unit.position),
         rotation: vectorToObject(unitRotation),
         scale: vectorToObject(unit.object.scale),
         params: {
            connectionId,
            unitNetworkId,
            name,
            hp,
            hpMax,
            fraction,
            damage,
            fireDamage,
            level,
            experience,
            speed,
            money,
            unspentTalents,
            equippedItems,
            acceleration: vectorToObject(acceleration),
            input: {
               vertical, horizontal,
               attack1: attack1 || isPostponedAttack,
               attack2: attack2 || isPostponedFire,
            },
         },
      });
   }
}
