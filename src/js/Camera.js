import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';

export default class Camera extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super();
        this.scene = scene;
        const ratio = this.getWidth() / this.getHeight();
        this.camera = new THREE.PerspectiveCamera(45, ratio, 1, 100);
        this.camera.position.set(5, 3, 15);
        this.deltaY = 10;
        this.rotateY = 0.25;
        this.defaultDistance = 10;
        this.distance = this.defaultDistance;
        this.raycaster = new THREE.Raycaster();
    }

    update() {
        const { scene: { input: { isThirdPerson } } } = this;
        const player = this.scene.getPlayer();

        if (!player) return;

        const rotateY = this.rotateY + this.scene.input.look.vertical / 5000;

        if (rotateY > -0.75 && rotateY < 1.25) {
            this.rotateY = rotateY;
        }

        if (isThirdPerson) {
            this.updateThirdPerson(player);
        } else {
            this.camera.position.copy(
                player.position.clone()
                    .add(new THREE.Vector3(7.5, this.deltaY, 0))
            );

            this.camera.lookAt(player.position);
        }

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

    updateThirdPerson(player) {
        const { scene: { scene: { children } }, deltaY } = this,
            playerHeadPosition = player.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
            origin = playerHeadPosition,
            destination = this.camera.position,
            direction = new THREE.Vector3();

        const getChildrenFlat = objects => [].concat(...objects.map(
            obj => obj.children
                ? [obj, ...getChildrenFlat(obj.children)]
                : [obj]
        ));

        const enviroment = [children.find(c => c.name === 'Level Environment')];
        const flatChildrenMeshes = getChildrenFlat(enviroment).filter(obj => obj.type === 'Mesh');

        this.raycaster.set(origin, direction.subVectors(destination, origin).normalize());
        this.raycaster.far = deltaY * 1.5;
        const intersects = this.raycaster.intersectObjects(flatChildrenMeshes);

        let distance = Math.min(deltaY, ...intersects.map(i => i.distance - this.distance * 0.5));
        this.distance += (distance - this.distance) / 2;

        const playerForward = player.getForward().multiplyScalar(this.scene.input.look.back ? 1 : -1);

        playerForward.y = this.rotateY;
        this.camera.position.copy(playerHeadPosition.clone().add(playerForward));

        this.camera.lookAt(playerHeadPosition);

        const cameraForward = new THREE.Vector3(0, 0, -1);
        cameraForward.applyQuaternion(this.camera.quaternion);

        this.camera.position.sub(cameraForward.multiplyScalar(this.distance));
    }

    toScreenPosition(position) {
        const widthHalf = 0.5 * this.getWidth();
        const heightHalf = 0.5 * this.getHeight();
        const copiedProjectVector = position.clone().project(this.camera);

        return {
            x: Math.round((copiedProjectVector.x + 1) * widthHalf),
            y: Math.round((-copiedProjectVector.y + 1) * heightHalf),
            z: copiedProjectVector.z
        }
    }
}