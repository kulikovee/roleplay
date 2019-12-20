const buildArea = (areaId, map) => {
    const { width, height } = AreaSizes[areaId];

    const waypointXToWorldX = position => position - width / 2;
    const waypointYToWorldZ = position => position - height / 2;

    const worldXToWaypointX = (position) => {
        const graphX = Math.round(position + width / 2);
        return Math.min(Math.max(graphX, 4), width - 5);
    };

    const worldZToWaypointY = (position) => {
        const graphY = Math.round(position + height / 2);
        return Math.min(Math.max(graphY, 4), height - 5);
    };

    const area = {
        id: areaId,
        waypointXToWorldX,
        waypointYToWorldZ,
        worldXToWaypointX,
        worldZToWaypointY,
        width,
        height,
    };

    return map(area);
};

const AreaSizes = {
    FLOOR_0: {
        width: 150,
        height: 150,
    },
    FLOOR_1: {
        width: 270,
        height: 270,
    },
    FLOOR_2: {
        width: 270,
        height: 270,
    }
};

const Areas = {
    FLOOR_0: buildArea('FLOOR_0', area => ({
        ...area,
        includesPosition: position => position.y < 100,
        getWorldWaypointByXY: (x, y) => ({ x: area.waypointXToWorldX(x), y: 0.2, z: area.waypointYToWorldZ(y) }),
        getWaypointPortals: () => [
            {
                from: { x: area.worldXToWaypointX(-49), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-49), y: area.worldZToWaypointY(0), areaId: 'FLOOR_1' }
            },
            {
                from: { x: area.worldXToWaypointX(-49), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-49), y: area.worldZToWaypointY(0), areaId: 'FLOOR_2' }
            }
        ],
    })),

    FLOOR_1: buildArea('FLOOR_1', area => ({
        ...area,
        includesPosition: position => position.y < 200,
        getWorldWaypointByXY: (x, y) => ({ x: area.waypointXToWorldX(x), y: 100.2, z: area.waypointYToWorldZ(y) }),
        getWaypointPortals: () => [
            {
                from: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0), areaId: 'FLOOR_0' }
            },
            {
                from: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0), areaId: 'FLOOR_2' }
            }
        ],
    })),

    FLOOR_2: buildArea('FLOOR_2', area => ({
        ...area,
        includesPosition: position => position.y >= 200,
        getWorldWaypointByXY: (x, y) => ({ x: area.waypointXToWorldX(x), y: 200.2, z: area.waypointYToWorldZ(y) }),
        getWaypointPortals: () => [
            {
                from: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0), areaId: 'FLOOR_0' }
            },
            {
                from: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0) },
                to: { x: area.worldXToWaypointX(-48), y: area.worldZToWaypointY(0), areaId: 'FLOOR_1' }
            }
        ],
    })),
};

export default Areas;