import AutoBindMethods from './AutoBindMethods.js';
import AnimatedGameObject from './GameObjects/AnimatedGameObject.js';

export default class Particles extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.particles = [];
    }

    update() {
        this.particles.forEach(p => p.update());
    }

    loadParticles({
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

                this.scene.intervals.setTimeout(
                    () => this.scene.gameObjectsService.destroyGameObject(particleSystem),
                    625
                );
            }
        });
    }

    getRandomPosition(area) {
        const random = (from, to) => Math.random() * (to - from) + from;

        return new THREE.Vector3(
            random(0, area.x),
            random(0, area.y),
            random(0, area.z),
        );
    }

    createParticles({
        particleCount = 1000,
        noScene = false,
        position = new THREE.Vector3(0, 5, 0),
        size = 0.01,
        color = 0xFFFFFF,
        blending = THREE.AdditiveBlending,
        depthTest = true,
        transparent = true,
        area = new THREE.Vector3(10, 5, 10),
        getParticleVelocity = () => new THREE.Vector3(-0.01, -0.01, 0),
        getParticlePosition = (i, position = this.getRandomPosition(area)) => position,
    } = {}) {
        const particles = new THREE.Geometry;
        const material = new THREE.PointCloudMaterial({ color, size, blending, depthTest, transparent });

        for (var i = 0; i < particleCount; i++) {
            const particle = getParticlePosition(i);
            particles.velocity = getParticleVelocity(i, particle);
            particles.vertices.push(particle);
        }

        const particleSystem = new THREE.PointCloud(particles, material);
        particleSystem.position.copy(position);

        this.particles.push({
            object: particleSystem,
            update: function () {
                let index = particleCount;

                while (index--) {
                    const particle = particles.vertices[index];

                    particle.velocity = getParticleVelocity(index, particle);

                    particle.x += particle.velocity.x;
                    particle.y += particle.velocity.y;
                    particle.z += particle.velocity.z;

                    const particlePosition = getParticlePosition(index, particle);

                    particle.x = particlePosition.x;
                    particle.y = particlePosition.y;
                    particle.z = particlePosition.z;
                }

                particles.verticesNeedUpdate = true;
            },
        });

        if (!noScene) {
            this.scene.add(particleSystem);
        }

        return particleSystem;
    }
}