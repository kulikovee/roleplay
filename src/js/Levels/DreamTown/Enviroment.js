import * as THREE from 'three';

const createEnvironment = function ({
    load,
    trees,
    houses,
    addColliderFunction,
    onLoad,
}) {
    const pivot = new THREE.Object3D();
    pivot.matrixAutoUpdate = false;
    pivot.name = 'Level Environment';

    let isEnviromentLoaded = false;
    let isTreeLoaded = false;
    let isHouseLoaded = false;

    const checkIsAllLoaded = () => {
        if (isEnviromentLoaded
            && isTreeLoaded
            && isHouseLoaded
        ) {
            onLoad && onLoad();
        }
    };

    load({
        baseUrl: './assets/models/environment/enviroment',
        noScene: true,
        castShadow: false,
        callback: object => {
            pivot.add(object.scene);
            object.scene.matrixAutoUpdate = false;
            object.scene.updateMatrix();
            isEnviromentLoaded = true;
            checkIsAllLoaded();
        }
    });

    load({
        baseUrl: './assets/models/environment/tree',
        noScene: true,
        receiveShadow: false,
        callback: (loadedModel) => {
            isTreeLoaded = true;
            checkIsAllLoaded();

            trees.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'Tree';
                model.position.set(position.x, position.y, position.z);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, z } = model.position;

                addColliderFunction(
                    (position) => Math.abs(position.x - x) < 2 && Math.abs(position.z - z) < 2
                );

                pivot.add(model);
            })
        }
    });

    load({
        baseUrl: './assets/models/environment/house1',
        receiveShadow: false,
        noScene: true,
        callback: (loadedModel) => {
            isHouseLoaded = true;
            checkIsAllLoaded();

            houses.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'House1';
                model.position.set(position.x, position.y, position.z);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, z } = model.position;

                addColliderFunction(
                    (position) => Math.abs(position.x - x) < 4 && Math.abs(position.z - z) < 3
                );

                pivot.add(model);
            });
        }
    });

    return pivot;
};

export { createEnvironment };
