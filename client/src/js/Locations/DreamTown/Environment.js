const createEnvironment = function({
   load,
   onLoad,
}) {
   const pivot = new THREE.Object3D();
   pivot.matrixAutoUpdate = false;
   pivot.name = 'LEVEL_ENVIRONMENT';

   let isEnvironmentLoaded = false;
   let isStaticLoaded = false;

   const checkIsAllLoaded = () => {
      if (isEnvironmentLoaded && isStaticLoaded) {
         onLoad && onLoad();
      }
   };

   load({
      baseUrl: './assets/models/environment/island',
      noScene: true,
      receiveShadow: true,
      castShadow: false,
      callback: object => {
         pivot.add(object.scene);
         object.scene.matrixAutoUpdate = false;
         object.scene.updateMatrix();
         isEnvironmentLoaded = true;
         checkIsAllLoaded();
      }
   });

   load({
      baseUrl: './assets/models/environment/water',
      castShadow: false,
      receiveShadow: false,
      callback: object => {
         object.scene.matrixAutoUpdate = false;
         object.scene.updateMatrix();
      }
   });

   load({
      baseUrl: './assets/models/environment/static-objects',
      noScene: true,
      receiveShadow: false,
      castShadow: true,
      callback: object => {
         pivot.add(object.scene);
         object.scene.matrixAutoUpdate = false;
         object.scene.updateMatrix();
         isStaticLoaded = true;
         checkIsAllLoaded();
      }
   });

   return pivot;
};

export { createEnvironment };
