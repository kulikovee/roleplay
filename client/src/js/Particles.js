import Scene from './Scene';
import AutoBindMethods from './AutoBindMethods';
import AnimatedGameObject from './GameObjects/AnimatedGameObject';

export default class Particles extends AutoBindMethods {
	/**
	 * @param {Scene} scene
	 */
	constructor(scene) {
		super();
		this.scene = scene;
		this.particles = [];
	}

	update(time) {
		this.particles.forEach(p => p.update(time));
	}

	destroy(particleSystem) {
		const index = this.particles.indexOf(particleSystem);

		if (index > -1) {
			this.particles.splice(index, 1);
		}

		this.scene.remove(particleSystem.object);
	}

	createSnow() {
		const area = new THREE.Vector3(100, 25, 100);

		this.createInstantParticles({
			particleCount: 10000,
			color: 0x888888,
			blending: THREE.NormalBlending,
			position: new THREE.Vector3(-area.x / 2, 0, -area.z / 2),
			getParticlePosition: (i, position = this.getRandomPosition(area)) => {
				if (position.y < 0) {
					const newPosition = this.getRandomPosition(area);
					position.x = newPosition.x;
					position.y = area.y;
					position.z = newPosition.z;
				}

				return position;
			}
		});
	}

	createEffect({
		scale = 1.5,
		effect = 'level-up-alt/level-up',
		position = {},
		attachTo,
		lifeTime = 2080,
	}) {
		this.scene.models.loadGLTF({
			baseUrl: './assets/models/effects/' + effect,
			noScene: true,
			castShadow: false,
			receiveShadow: false,
			callback: loadedObject => {
				loadedObject.scene.scale.set(scale, scale, scale);

				loadedObject.scene.traverse((child) => {
					if (child.isMesh) {
						child.material.transparent = true;
						child.material.alphaTest = 0.5;
					}
				});

				loadedObject.scene.position.set(position.x || 0, position.y || 0, position.z || 0);

				if (attachTo) {
					attachTo.add(loadedObject.scene);
				}

				const effect = new AnimatedGameObject({
					object: loadedObject.scene,
					animations: loadedObject.animations,
				});

				this.scene.gameObjectsService.hookGameObject(effect);

				this.scene.intervals.setTimeout(
					() => this.scene.gameObjectsService.destroyGameObject(effect),
					lifeTime,
				);
			}
		});
	}

	loadEffect({
		particleName = 'blood',
		position = new THREE.Vector3(),
		scale = new THREE.Vector3(1, 1, 1)
	} = {}) {
		const gameObjectsService = this.scene.gameObjectsService;

		return this.scene.models.loadGLTF({
			baseUrl: `./assets/models/effects/${particleName}`,
			castShadow: false,
			receiveShadow: false,
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

	createAttachedParticles({
		count = 1000,
		noScene = false,
		size = 0.02,
		color = 0xFFFFFF,
		blending = THREE.AdditiveBlending,
		depthTest = true,
		depthWrite = false,
		transparent = true,
		lifeTime,
		parent,
		texture,
		getDefaultParticleVelocity = () => new THREE.Vector3(
			Math.random() * 0.01 - 0.005,
			Math.random() * 0.01 - 0.0025,
			Math.random() * 0.01 - 0.005,
		),
		getDefaultParticlePosition = () => new THREE.Vector3(
			Math.random() * 0.2 - 0.1,
			Math.random() * 0.2 - 0.1,
			Math.random() * 0.2 - 0.1,
		),
	} = {}) {
		const particalesCount = count;
		const particles = new THREE.Geometry;
		const particlesInitialPositions = {};
		const particlesCreatedAt = {};
		const particlesLocalPosition = {};
		const velocities = {};
		const materialParameters = { color, size, blending, depthTest, depthWrite, transparent };

		if (texture) {
			materialParameters.map = texture;
		}

		const material = new THREE.PointsMaterial(materialParameters);

		for (let i = 0; i < particalesCount; i++) {
			const particle = getDefaultParticlePosition(i);
			particlesInitialPositions[i] = parent.position.clone();

			velocities[i] = getDefaultParticleVelocity(i);
			particlesLocalPosition[i] = { x: 0, y: 0, z: 0 };
			particles.vertices.push(particle);
		}

		const particleObject = new THREE.Points(particles, material);
		particleObject.position.copy(parent.position);
		const lifeTimeMs = lifeTime * 1000;

		const getCreatedAt = (time, offset = 0) => time  + offset + Math.random() * lifeTime * 1000 - lifeTime * 1000 / 2;

		const particleSystem = {
			object: particleObject,
			pause: false,
			update: function(time) {
				particleObject.position.copy(parent.position);

				particles.vertices.forEach((particle, i) => {
					if (!particlesCreatedAt[i]) {
						particlesCreatedAt[i] = getCreatedAt(time, -500);
					} else if (time - particlesCreatedAt[i] > lifeTimeMs) {

						if (particleSystem.pause) {
							particlesInitialPositions[i] = parent.position.clone();
							velocities[i] = new THREE.Vector3();
						} else {
							const defaultParticalPosition = getDefaultParticlePosition(i);
							particlesInitialPositions[i] = parent.position.clone().add(defaultParticalPosition);
						}

						particlesLocalPosition[i] = { x: 0, y: 0, z: 0 };
						particlesCreatedAt[i] = getCreatedAt(time);
					}

					const currentDelta = {
						x: particlesInitialPositions[i].x - particleObject.position.x,
						y: particlesInitialPositions[i].y - particleObject.position.y,
						z: particlesInitialPositions[i].z - particleObject.position.z,
					};

					particlesLocalPosition[i].x += velocities[i].x;
					particlesLocalPosition[i].y += velocities[i].y;
					particlesLocalPosition[i].z += velocities[i].z;

					particle.x = particlesLocalPosition[i].x + currentDelta.x;
					particle.y = particlesLocalPosition[i].y + currentDelta.y;
					particle.z = particlesLocalPosition[i].z + currentDelta.z;
				});

				particles.verticesNeedUpdate = true;
			},
		};

		this.particles.push(particleSystem);

		if (!noScene) {
			this.scene.add(particleSystem.object);
		}

		return particleSystem;
	}

	getRandomPosition(area) {
		const random = (from, to) => Math.random() * (to - from) + from;

		return new THREE.Vector3(
			random(0, area.x),
			random(0, area.y),
			random(0, area.z),
		);
	}

	createInstantParticles({
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
			update: function() {
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