import * as THREE from 'three';
import * as GLTFLoader from "three-gltf-loader";
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
    createCube(params) {
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

        const cube = new THREE.Mesh(
            new THREE.CubeGeometry(params.x || 1, params.y || 1, params.z || 1),
            new THREE.MeshLambertMaterial(materialParams)
        );

        if (params.position) {
            cube.position.set(
                params.position.x || 0,
                params.position.y || 0,
                params.position.z || 0
            );
        }

        if (params.rotation) {
            cube.rotation.set(
                params.rotation.x || 0,
                params.rotation.y || 0,
                params.rotation.z || 0
            );
        }

        if (!params.noScene) {
            this.scene.add(cube);
        }

        return cube;
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