import AutoBindMethods from './AutoBindMethods.js';

export default class Camera extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super();
        this.scene = scene;
        const ratio = this.getWidth() / this.getHeight();
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);
        this.camera.position.set(5, 3, 15);
        this.deltaY = 3;
        this.defaultDistance = 10;
        this.distance = this.defaultDistance;
        this.raycaster = new THREE.Raycaster();
    }

    update() {
        const { scene: { input: { isThirdPerson } } } = this;
        const player = this.scene.getPlayer();

        if (!player) return;

        const distanceToPlayer = new THREE.Vector3(0, this.deltaY, 0);

        this.camera.position.copy(
            player.position.clone().add(
                distanceToPlayer.add(
                    isThirdPerson
                        ? this.getThirdPersonPosition(player)
                        : new THREE.Vector3(7.5, 0, 0)
                )
            )
        );

        this.camera.lookAt(player.position);
    }

    addY(y) {
        if (this.deltaY + y > 1 && this.deltaY + y < 25) {
            this.deltaY += y;
        }
    }

    getWidth() {
        const renderer = this.scene.renderer.renderer;
        return renderer.getContext().canvas.width;
    }

    getHeight() {
        const renderer = this.scene.renderer.renderer;
        return renderer.getContext().canvas.height;
    }

    getThirdPersonPosition(player) {
        const { scene: { scene: { children } }, defaultDistance } = this,
            origin = player.object.position,
            destination = this.camera.position,
            direction = new THREE.Vector3(),
            far = new THREE.Vector3();

        let intersectObjects = [children.find(c => c.name === 'Level Environment')];

        const getChildrenFlat = objects => [].concat(...objects.map(
            obj => obj.children
                ? [obj, ...getChildrenFlat(obj.children)]
                : [obj]
        ));

        const flatChildrenMeshes = getChildrenFlat(intersectObjects).filter(obj => obj.type === 'Mesh');

        this.raycaster.set(origin, direction.subVectors(destination, origin).normalize());
        this.raycaster.far = defaultDistance;
        const intersects = this.raycaster.intersectObjects(flatChildrenMeshes);

        let distance = Math.min(defaultDistance, ...intersects.map(i => i.distance - 2));
        this.distance += (distance - this.distance) * 0.1;

        return player.getForward().multiplyScalar(-this.distance);
    }

    toScreenPosition(vector) {
        const widthHalf = 0.5 * this.getWidth();
        const heightHalf = 0.5 * this.getHeight();
        const copiedProjectVector = vector.clone().project(this.camera);

        return {
            x: Math.round((copiedProjectVector.x + 1) * widthHalf),
            y: Math.round((-copiedProjectVector.y + 1) * heightHalf),
            z: copiedProjectVector.z
        }
    }

    objectToScreenPosition(obj) {
        const vector = new THREE.Vector3();
        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);

        return this.toScreenPosition(vector);
    }
}