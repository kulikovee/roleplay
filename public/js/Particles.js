export default class Particles {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
        this.gravity = new THREE.Vector3(0, 0.05, 0);
        this.createParticles = this.createParticles.bind(this);
        this.destroyParticleSystem = this.destroyParticleSystem.bind(this);
        this.update = this.update.bind(this);
    }

    update() {
        this.particleSystems.forEach(particles => {
            particles.position
                .add(particles.velocityPosition.multiplyScalar(0.95))
                .sub(this.gravity);

            const scale = particles.velocityScale.multiplyScalar(1.01);
            particles.scale.set(scale.x, scale.y, scale.z);
        });
    }

    createParticles({
        position = new THREE.Vector3(),
        area = new THREE.Vector3(0.25, 0.5, 0.25),
        count = 10,
        size = 1,
        color = 0xAA0000,
        getColor = null,
    } = {}) {
        var uniforms = {
            pointTexture: { value: new THREE.TextureLoader().load("./public/assets/textures/spark1.png") }
        };
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            vertexColors: true
        });
        var geometry = new THREE.BufferGeometry();
        var positions = [];
        var colors = [];
        var sizes = [];
        var threeColor = new THREE.Color(color);
        for (var i = 0; i < count; i++) {
            positions.push((Math.random() * 2 - 1) * area.x);
            positions.push((Math.random() * 2 - 1) * area.y);
            positions.push((Math.random() * 2 - 1) * area.z);

            if (getColor) {
                threeColor.setHSL(getColor(i, position), 1.0, 0.5);
            }

            colors.push(threeColor.r, threeColor.g, threeColor.b);
            sizes.push(size);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
        var particleSystem = new THREE.Points(geometry, shaderMaterial);

        particleSystem.velocityPosition = new THREE.Vector3(0, 0.1, 0);
        particleSystem.velocityScale = new THREE.Vector3(1, 1, 1);
        particleSystem.position.copy(position);

        this.particleSystems.push(particleSystem);

        setTimeout(() => this.destroyParticleSystem(particleSystem), 1000);

        this.scene.add(particleSystem);
    }


    /**
     * @param {THREE.Object3D} particleSystem
     */
    destroyParticleSystem(particleSystem) {
        const index = this.particleSystems.indexOf(particleSystem);

        if (index > -1) {
            this.particleSystems.splice(index, 1);
        }

        this.scene.remove(particleSystem);
    }
}