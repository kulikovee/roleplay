
const createEnvironment = function ({
    load,
    trees,
    sidewalks,
    houses,
    addColliderFunction,
    onLoad,
}) {
    const pivot = new THREE.Object3D();
    pivot.matrixAutoUpdate = false;
    pivot.name = 'LEVEL_ENVIRONMENT';

    let isEnvironmentLoaded = false;
    let isTreeLoaded = false;
    let isHouseLoaded = false;

    const checkIsAllLoaded = () => {
        if (isEnvironmentLoaded
            && isTreeLoaded
            && isHouseLoaded
        ) {
            onLoad && onLoad();
        }
    };

    load({
        baseUrl: './assets/models/environment/city',
        noScene: true,
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
        baseUrl: './assets/models/environment/sidewalk',
        noScene: true,
        receiveShadow: true,
        castShadow: false,
        callback: (loadedModel) => {
            isTreeLoaded = true;
            checkIsAllLoaded();

            sidewalks.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'Sidewalk';
                model.position.set(position.x, position.y, position.z);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, y, z } = model.position;

                addColliderFunction(
                    (position) =>
                       Math.abs(position.x - x) < 25.3
                       && Math.abs(position.z - z) < 33
                       && Math.abs(position.y - y) < 0.2
                );

                pivot.add(model);
            })
        }
    });

    load({
        baseUrl: './assets/models/environment/house2',
        receiveShadow: false,
        noScene: true,
        callback: (loadedModel) => {
            isHouseLoaded = true;
            checkIsAllLoaded();

            houses.forEach((position) => {
                const model = loadedModel.scene.clone();
                model.name = 'House1';
                model.position.set(position.x, position.y, position.z);
                model.rotation.set(position.rx || 0, position.ry || 0, position.rz || 0);
                model.matrixAutoUpdate = false;
                model.updateMatrix();

                const { x, z } = model.position;

                addColliderFunction(unitPosition => (
                    Math.abs(unitPosition.x - x) < (position.ry < -3.13 ? 21 : 4.3)
                    && Math.abs(unitPosition.z - z) < (position.ry < -3.13 ? 4.5 : 21)
                ));

                pivot.add(model);
            });
        }
    });

    return pivot;
};

export { createEnvironment };
