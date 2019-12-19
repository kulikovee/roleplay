import AutoBindMethods from './AutoBindMethods';
import AStar from './Utils/AStar';
import * as THREE from 'three';

export default class Colliders extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.length = 150;
    }

    getNextPoint(from, to) {
        const fromX = this.toGraphCoords(from.x),
            fromY = this.toGraphCoords(from.z),
            toX = this.toGraphCoords(to.x),
            toY = this.toGraphCoords(to.z);

        let start = this.getFreeGraphPoint(fromX, fromY);
        let end = this.getFreeGraphPoint(toX, toY);

        if (start && end) {
            let result = AStar.astar.search(
                this.graph,
                start,
                end,
                { heuristic: AStar.astar.heuristics.diagonal }
            );

            const nextGraphPoint = result.length > 1 ? result[1] : null;

            if (nextGraphPoint) {
                return new THREE.Vector3(
                    this.toWorldCoords(nextGraphPoint.x),
                    to.y,
                    this.toWorldCoords(nextGraphPoint.y)
                );
            }
        }

        return to;
    }

    getFreeGraphPoint(x, y) {
        const grid = this.graph.grid;

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

    toGraphCoords(worldPosition) {
        const value = Math.round(worldPosition + this.length / 2);

        return Math.min(Math.max(value, 4), this.length - 5);
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
                        && checkWay(getVector(x + 1, y + 1))
                        && checkWay(getVector(x + 1, y - 1))
                        && checkWay(getVector(x - 1, y + 1))
                        && checkWay(getVector(x - 1, y - 1))
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