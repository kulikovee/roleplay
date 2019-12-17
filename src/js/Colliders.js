import AutoBindMethods from './AutoBindMethods';
import AStar from './Utils/AStar';

export default class Colliders extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.colliders = [];
        this.nextId = 0;
        this.waypoints = this.getWaypoints();

        // const startedAt = Date.now();
        // this.buildPaths(this.waypoints);
        // const finishedAt = Date.now();
        // console.log(`Paths Building is finished (${((finishedAt - startedAt) / 1000).toFixed(2)}s)`, this.waypoints);

        console.log({ AStar });
        this.test();
    }

    test() {
        const length = 100;
        const data = new Array(length).fill(null).map(
            (n1, y) => new Array(length).fill(null).map(
                (n2, x) => Number(
                     y % 4 === 0
                        ? (x === length - 1)
                        : ((y - 3) % 4 === 0 || (y - 1) % 4 === 0|| x === 0)
                )
            )
        );

        data[1][1] = 1;
        data[length - 2][length - 2] = 1;

        let graph = new AStar.Graph(data, { diagonal: true });
        let start = graph.grid[1][1];
        let end = graph.grid[length - 2][length - 2];
        const startedAt = Date.now();
        let result = AStar.astar.search(graph, start, end, { heuristic: AStar.astar.heuristics.diagonal });
        const finishedAt = Date.now();
        console.log(`Paths Finding is finished (${((finishedAt - startedAt) / 1000).toFixed(2)}s)`, result, { graph, data });
    }

    buildPaths(waypoints) {
        waypoints.forEach((waypointFrom) => {
            const waypointFromId = waypointFrom.getId();

            waypoints.forEach((waypointTo) => {
                const waypointToId = waypointTo.getId();

                if (waypointToId === waypointFromId || waypointFrom.pathsTo[waypointToId]) {
                    return;
                }

                const connections = Object.values(waypointFrom.connections);
                const paths = connections
                    .map(c => this.findPaths(c, waypointTo, [waypointFromId]))
                    .flat()
                    .sort((a, b) => (
                        a.distance > b.distance
                            ? 1
                            : (
                                a.distance < b.distance
                                    ? -1
                                    : (a.ids.length < b.ids.length ? 1 : -1) // More points = More specified path
                            )
                    ));

                if (paths.length) {
                    const path = paths[0];
                    waypointFrom.pathsTo[waypointToId] = path;

                    const reversePath = { ...path, ids: [...path.ids].reverse() };
                    waypointTo.pathsTo[waypointFromId] = reversePath;
                }
            });
        });
    }

    findPaths(connection, waypointTo, visited = [], distance = 0) {
        const waypointToId = waypointTo.getId();
        const connectionWaypointId = connection.waypoint.getId();

        if (connection.waypoint.pathsTo[waypointToId]) {
            return connection.waypoint.pathsTo[waypointToId];
        }

        const totalDistance = distance + connection.distance;
        const isNew = visited.indexOf(connectionWaypointId) === -1;
        const ids = isNew ? [...visited, connectionWaypointId] : visited;
        const isFinish = connectionWaypointId === waypointToId;
        let result = [];

        if (isNew) {
            if (!isFinish) {
                const connections = Object.values(connection.waypoint.connections);
                const nodes = connections.map(c => this.findPaths(c, waypointTo, ids, totalDistance));
                result = [...result, ...nodes.flat()];
            } else {
                result.push({
                    ids,
                    distance: totalDistance,
                    success: isFinish,
                });
            }
        }

        return result;
    };

    checkWay(position, gameObject) {
        for(let collider of this.colliders) {
            if (collider.fn(position, gameObject)) {
                return false;
            }
        }

        return true;
    }

    getWaypoints() {
        function getWaypoints(points) {
            // Update points to waypoints
            points.forEach((w1) => {
                w1.distanceTo = w2 => Math.sqrt(
                    Math.pow(w2.z - w1.z, 2)
                    + Math.pow(w2.y - w1.y, 2)
                    + Math.pow(w2.x - w1.x, 2)
                );
                w1.getId = () => `${w1.x}, ${w1.y}, ${w1.z}`;
                w1.connections = {};
                w1.pathsTo = {};
            });

            // Create Graph connections
            points.forEach((from) => {
                let idFrom = from.getId();

                points.forEach((to) => {
                    let idTo = to.getId();

                    if (idFrom === idTo || from.distanceTo(to) > 1) {
                        return;
                    }

                    from.connections[idTo] = { waypoint: to, distance: from.distanceTo(to) };
                });
            });

            return points;
        }


        return getWaypoints([
            { x: 0, y: 0.25, z: 0 },
            { x: 1, y: 0.25, z: 0 },
            { x: 2, y: 0.25, z: 0 },
            { x: 3, y: 0.25, z: 0 },
            { x: 4, y: 0.25, z: 0 },
            { x: 5, y: 0.25, z: 0 },
            { x: 6, y: 0.25, z: 0 },
            { x: 7, y: 0.25, z: 0 },
            { x: 8, y: 0.25, z: 0 }, // Paths building took 0.00s


            // Add 7 points
            { x: 1, y: 0.25, z: 1 },
            { x: 2, y: 0.25, z: 1 },
            { x: 3, y: 0.25, z: 1 },
            { x: 4, y: 0.25, z: 1 },
            { x: 5, y: 0.25, z: 1 },
            { x: 6, y: 0.25, z: 1 },
            { x: 7, y: 0.25, z: 1 },
            { x: 8, y: 0.25, z: 1 }, // Paths building took 0.07s

            // Add 7 points
            { x: 1, y: 0.25, z: -1 },
            { x: 2, y: 0.25, z: -1 },
            { x: 3, y: 0.25, z: -1 },
            { x: 4, y: 0.25, z: -1 },
            { x: 5, y: 0.25, z: -1 },
            { x: 6, y: 0.25, z: -1 },
            { x: 7, y: 0.25, z: -1 },
            { x: 8, y: 0.25, z: -1 }, // Paths building took 2.53s


            // Add a point
            { x: 1, y: 0.25, z: -2 }, // Paths building took 2.82s

            // Add a point
            { x: 2, y: 0.25, z: -2 }, // Paths building took 3.82s

            // Add a point
            // { x: 3, y: 0.25, z: -2 }, // Paths building took 6.99s
        ]);
    }

    getPathFromTo(from, to) {
        const getClosestWaypoint = point => this.waypoints.reduce((closestWaypoint, waypoint) => (
            waypoint.distanceTo(point) < closestWaypoint.distanceTo(point)
                ? waypoint
                : closestWaypoint
        ));

        const fromWaypoint = getClosestWaypoint(from);
        const toWaypoint = getClosestWaypoint(to);

        return fromWaypoint.pathsTo[toWaypoint.getId()];
    }

    resetColliders() {
        this.colliders = [];
    }

    removeCollider(id) {
        const idx = this.colliders.findIndex(c => c.id === id);

        if (idx > -1) {
            this.colliders.splice(idx, 1);
        }
    }

    addColliderFunction(fn) {
        this.colliders.push({
            id: this.nextId++,
            fn,
        });

    }
}