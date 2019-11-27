import AnimatedGameObject from './GameObjects/AnimatedGameObject.js';

export default class Particles {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.loadParticles = this.loadParticles.bind(this);
        this.createParticles = this.createParticles.bind(this);
        this.update = this.update.bind(this);
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

    createParticles({
        particleCount = 100,
        noScene = false,
    } = {}) {
        const particles = new THREE.Geometry;

        const pMaterial = new THREE.PointCloudMaterial({
           color: 0xFFFFFF,
           size: 4,
           blending: THREE.AdditiveBlending,
           depthTest: false,
           transparent: true
        });

        for (var i = 0; i < particleCount; i++) {
            const pX = Math.random() * 100 - 50,
                pY = Math.random() * 50 - 25,
                pZ = Math.random() * 100 - 50,
                particle = new THREE.Vector3(pX, pY, pZ);
            particle.velocity = {};
            particle.velocity.y = -1;
            particles.vertices.push(particle);
        }

        const particleSystem = new THREE.PointCloud(particles, pMaterial);
        particleSystem.position.y = 200;

        if (!noScene) {
            this.scene.add(particleSystem);
        }

        const particlesWrapper = {
            object: particleSystem,
            update: function () {
                let pCount = particleCount;

                while (pCount--) {
                    const particle = particles.vertices[pCount];
                    if (particle.y < -20) {
                        particle.y = 20;
                        particle.velocity.y = -1.2;
                    }

                    particle.velocity.y -= Math.random() * .02;

                    particle.y += particle.velocity.y;
                }

                particles.verticesNeedUpdate = true;
            },
        };

        this.particles.push(particlesWrapper);

        return particlesWrapper;
    }
}