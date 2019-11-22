import AnimatedGameObject from './GameObjects/AnimatedGameObject.js';

export default class Particles {
    constructor(scene) {
        this.scene = scene;
        this.createParticles = this.createParticles.bind(this);
        this.update = this.update.bind(this);
    }

    update() {
    }

    createParticles({
        particleName = 'blood',
        position = new THREE.Vector3(),
        scale = new THREE.Vector3(1, 1, 1)
    } = {}) {
        const gameObjectsService = this.scene.gameObjectsService;

        return this.scene.loadGLTF({
            baseUrl: `./public/assets/models/effects/${particleName}`,
            callback: (gltf) => {
                gltf.scene.position.copy(position);
                gltf.scene.scale.copy(scale);
                gltf.scene.rotation.set(0, Math.random() * Math.PI, 0);

                const particleSystem = gameObjectsService.hookGameObject(new AnimatedGameObject({
                    object: gltf.scene,
                    animations: gltf.animations,
                }));

                setTimeout(() => this.scene.gameObjectsService.destroyGameObject(particleSystem), 625);
            }
        });
    }
}