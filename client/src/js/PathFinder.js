import AutoBindMethods from './AutoBindMethods';
import AStar from './Utils/AStar';

export default class Colliders extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.areas = [];
    }

    getNextPoint(from, to) {
        const area = this.getAreaByPosition(from),
            fromX = area.worldXToWaypointX(from.x),
            fromY = area.worldZToWaypointY(from.z),
            areaTo = this.getAreaByPosition(to);

        let toX;
        let toY;
        let portal;

        if (area.id === areaTo.id) {
            toX = area.worldXToWaypointX(to.x);
            toY = area.worldZToWaypointY(to.z);
        } else {
            portal = area.getWaypointPortals().find(portal => portal.to.areaId === areaTo.id);

            if (portal) {
                toX = portal.from.x;
                toY = portal.from.y;
            } else {
                return to;
            }
        }

        let start = this.getFreeGraphPoint(area.graph, fromX, fromY);
        let end = this.getFreeGraphPoint(area.graph, toX, toY);

        if (start && end) {
            let result = AStar.astar.search(
                area.graph,
                start,
                end,
                { heuristic: AStar.astar.heuristics.diagonal }
            );

            const nextGraphPoint = result[2] || result[1];

            if (nextGraphPoint) {
                const nextWorldPoint = new THREE.Vector3(
                    area.waypointXToWorldX(nextGraphPoint.x),
                    to.y,
                    area.waypointYToWorldZ(nextGraphPoint.y)
                );

                return nextWorldPoint;
            } else {
                return null;
            }
        }

        return to;
    }

    getFreeGraphPoint(graph, x, y) {
        const grid = graph.grid;

        const getWeight = (x, y) => grid[x] && grid[x][y] && grid[x][y].weight;

        const getNearFreePoint = range => (
            (getWeight(x + range, y) && grid[x + range][y])
            || (getWeight(x - range, y) && grid[x - range][y])
            || (getWeight(x, y + range) && grid[x][y + range])
            || (getWeight(x, y - range) && grid[x][y - range])
        );

        return (
            (getWeight(grid[x][y]) && grid[x][y])
            || getNearFreePoint(1)
            || getNearFreePoint(2)
            || getNearFreePoint(3)
            || getNearFreePoint(4)
            || null
        );
    }

    rebuildAreas() {
        if (this.scene.location) {
            this.areas = this.scene.location.getAreas().map(area => ({
                ...area,
                graph: new AStar.Graph(area.getWaypoints(), { diagonal: true }),
            }));
        }
    }

    getAreaByPosition(position) {
        return this.areas.find(area => area.includesPosition(position));
    }
}