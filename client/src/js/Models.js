import AutoBindMethods from './AutoBindMethods';

export default class Models extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
    }

    /**
     * @param {Object} params
     * @param {number} params.repeatX
     * @param {number} params.repeatY
     * @param {number} params.emissive
     * @param {THREE.Vector3} params.position
     * @returns {THREE.Mesh}
     */
    createGeometry(params) {
        params = params || {};

        const materialParams = {};

        if (params.image) {
            const texture = new THREE.TextureLoader().load(params.image);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(params.repeatX || 1, params.repeatY || 1);
            materialParams.map = texture;
        }

        if (params.emissive) {
            materialParams.emissive = new THREE.Color(params.emissive);
            materialParams.emissiveIntensity = 1.0;
            materialParams.emissiveMap = null;
        }

        if (params.color) {
            materialParams.color = params.color;
        }

        const geometry = new THREE.Mesh(
            params.geometry || new THREE.CubeGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial(materialParams)
        );

        if (params.rotation) {
            geometry.rotation.copy(params.rotation);
        }

        geometry.scale.set(params.x || 1, params.y || 1, params.z || 1);

        const pivot = new THREE.Object3D();
        pivot.add(geometry);

        if (params.rotation) {
            pivot.rotation.copy(params.rotation);
        }

        if (params.localPosition) {
            geometry.position.set(
                params.localPosition.x || 0,
                params.localPosition.y || 0,
                params.localPosition.z || 0
            );
        }

        if (params.position) {
            pivot.position.set(
                params.position.x || 0,
                params.position.y || 0,
                params.position.z || 0
            );
        }

        if (params.rotation) {
            pivot.rotation.set(
                params.rotation.x || 0,
                params.rotation.y || 0,
                params.rotation.z || 0
            );
        }

        if (!params.noScene) {
            this.scene.add(pivot);
        }

        return pivot;
    }

    loadGLTF({
        baseUrl,
        isGLTF = false,
        noScene = false,
        callback = () => null,
        castShadow = true,
        receiveShadow = true,
    }) {
        const loader = new GLTFLoader();
        const url = `${baseUrl}.glb${isGLTF ? '.gltf' : ''}`;
        
        loader.load(url, (loadedModel) => {
            loadedModel.scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = castShadow;
                    child.receiveShadow = receiveShadow;
                }
            });

            callback(loadedModel);

            if (!noScene) {
                this.scene.add(loadedModel.scene);
            }
        });
    }
}