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
        width: 300,
        height: 300,
    },
};

const Areas = {
    FLOOR_0: buildArea('FLOOR_0', area => ({
        ...area,
        includesPosition: position => position.y < 250,
        getWorldWaypointByXY: (x, y) => ({ x: area.waypointXToWorldX(x), y: 10.2, z: area.waypointYToWorldZ(y) }),
        getWaypointPortals: () => [],
    })),
};

export default Areas;