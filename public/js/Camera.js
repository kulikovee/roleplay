export default class Camera {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        const ratio = this.getWidth() / this.getHeight();
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100000);
        this.camera.position.set(5, 3, 15);
        this.deltaY = 5;
        this.distance = 10;
        this.raycaster = new THREE.Raycaster();

        this.toScreenPosition = this.toScreenPosition.bind(this);
        this.objectToScreenPosition = this.objectToScreenPosition.bind(this);
        this.getThirdPersonPosition = this.getThirdPersonPosition.bind(this);
        this.update = this.update.bind(this);
        this.getWidth = this.getWidth.bind(this);
        this.getHeight = this.getHeight.bind(this);
        this.addY = this.addY.bind(this);
    }

    update() {
        const { scene: { input: { isThirdPerson }, scene: { children } } } = this;
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
        const defaultDistance = 10;

        const origin = player.object.position;
        const destination = this.camera.position;
        const direction = new THREE.Vector3();
        const far = new THREE.Vector3();

        let intersectObjects = [children.find(c => c.name === 'Level Environment')];

        const getChildrenFlat = objects => [].concat(...objects.map(obj => obj.children ? [obj, ...getChildrenFlat(obj.children)] : [obj]));
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