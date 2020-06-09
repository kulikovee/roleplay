import AutoBindMethods from '../../AutoBindMethods';

export default class Elevator extends AutoBindMethods {
    constructor(scene, params) {
        super();

        this.scene = scene;
        this.params = params;

        this.currentFloor = 1;
        this.target = 0;
        this.direction = -1;
        this.speed = 0.3;
        this.standTime = 10;

        this.object = this.scene.models.createGeometry(params);
        this.standAt = this.scene.intervals.getTimePassed();
    }

    isReleased() {
        return (
            this.scene.intervals.getTimePassed() - this.standAt > this.standTime * 1000
        );
    }

    isCarrying({ x, y, z }) {
        const { object: { position, scale } } = this;

        return (
            Math.abs(x - position.x) < scale.x / 2
            && Math.abs(z - position.z) < scale.z / 2
            && (y - position.y < scale.y / 2)
            // && (y + 1.7) - position.y > -scale.y / 2
        );
    };

    getFloor() {
        return (
            this.direction > 0
                ? (
                    (this.object.position.y >= 200 && 2)
                    || (this.object.position.y >= 100 && 1)
                    || 0
                )
                : (
                    (this.object.position.y > 100 && 2)
                    || (this.object.position.y > 0 && 1)
                    || 0
                )
        );
    }

    update() {
        if (this.isReleased()) {
            const floor = this.getFloor();

            if (floor !== this.currentFloor) {
                this.standAt = this.scene.intervals.getTimePassed();
                this.currentFloor = floor;

                if (floor === 2) {
                    this.direction = -1;
                } else if (floor === 0) {
                    this.direction = 1;
                }

                this.target = floor + this.direction;
            } else {
                const getCarryingPosition = unit => ({ ...unit.position, y: unit.position.y - (this.direction > 0 ? 2 : 0.1) });
                const carryingUnits = this.scene.gameObjectsService.getUnits().filter(
                    unit => (this.isCarrying(getCarryingPosition(unit))),
                );

                const thisAcceleration = this.speed * this.direction;
                carryingUnits.forEach((unit) => { unit.position.y += thisAcceleration; });
                this.object.position.y += thisAcceleration;
            }
        }
    };
}