import AutoBindMethods from './AutoBindMethods';
import AStar from './Utils/AStar';
import * as THREE from 'three';

export default class Colliders extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.length = 100;
    }

    getNextPoint(from, to) {
        let start = this.getFreeGraphPoint(this.toGraphCoords(from.x), this.toGraphCoords(from.z));
        let end = this.getFreeGraphPoint(this.toGraphCoords(to.x), this.toGraphCoords(to.z));

        let result = AStar.astar.search(
            this.graph,
            start,
            end,
            { heuristic: AStar.astar.heuristics.diagonal }
        );

        const nextGraphPoint = result.length > 1 ? result[1] : null;

        return nextGraphPoint
            ? new THREE.Vector3(
                this.toWorldCoords(nextGraphPoint.x),
                to.y,
                this.toWorldCoords(nextGraphPoint.y)
            )
            : to;
    }

    getFreeGraphPoint(x, y) {
        const grid = this.graph.grid;

        return (
            (grid[x][y].weight && grid[x][y])
            || (grid[x + 1][y].weight && grid[x + 1][y])
            || (grid[x - 1][y].weight && grid[x - 1][y])
            || (grid[x][y + 1].weight && grid[x][y + 1])
            || (grid[x][y - 1].weight && grid[x][y - 1])
            || (grid[x + 2][y].weight && grid[x + 2][y])
            || (grid[x - 2][y].weight && grid[x - 2][y])
            || (grid[x][y + 2].weight && grid[x][y + 2])
            || (grid[x][y - 2].weight && grid[x][y - 2])
            || (grid[x + 3][y].weight && grid[x + 3][y])
            || (grid[x - 3][y].weight && grid[x - 3][y])
            || (grid[x][y + 3].weight && grid[x][y + 3])
            || (grid[x][y - 3].weight && grid[x][y - 3])
            || (grid[x + 4][y].weight && grid[x + 4][y])
            || (grid[x - 4][y].weight && grid[x - 4][y])
            || (grid[x][y + 4].weight && grid[x][y + 4])
            || (grid[x][y - 4].weight && grid[x][y - 4])
            || grid[x][y]
        );
    }

    toGraphCoords(worldPosition) {
        return Math.round(worldPosition + this.length / 2);
    }

    toWorldCoords(graphPosition) {
        return graphPosition - this.length / 2;
    }

    rebuildGraph() {
        this.graph = new AStar.Graph(this.getWaypoints(), { diagonal: true });
    }

    getWaypoints(length = this.length) {
        const checkWay = this.scene.colliders.checkWay;
        const getVector = (x, z) => new THREE.Vector3(this.toWorldCoords(x), 0.1, this.toWorldCoords(z));

        return new Array(length).fill(null).map(
            (n1, y) => new Array(length).fill(null).map(
                (n2, x) => (
                    Number(
                        checkWay(getVector(x, y))
                        && checkWay(getVector(x + 1, y))
                        && checkWay(getVector(x - 1, y))
                        && checkWay(getVector(x, y + 1))
                        && checkWay(getVector(x, y - 1))
                        && checkWay(getVector(x + 2, y))
                        && checkWay(getVector(x - 2, y))
                        && checkWay(getVector(x, y + 2))
                        && checkWay(getVector(x, y - 2))
                    )
                )
            )
        );
    }
}