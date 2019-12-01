import AutoBindMethods from './AutoBindMethods';
import AnimatedGameObject from "./GameObjects/AnimatedGameObject";

export default class Connection extends AutoBindMethods {
    /**
     * @param {Scene} scene
     * @param {string|number} ip
     * @param {string|number} port
     * @param {boolean} isSecure
     */
    constructor(scene, ip = 'localhost', port = '1337', isSecure = true) {
        super();
        this.scene = scene;

        const WebSocket = window.WebSocket || window.MozWebSocket;

        this.connection = new WebSocket(`${isSecure ? 'wss' : 'ws'}://${ip}:${port}`);
        this.connection.onopen = () => console.log('open connection');
        this.connection.onerror = (error) => console.log('error connection', error);
        this.connection.onmessage = this.onMessage;
        this.players = {};
    }

    onMessage({ data }) {
        const json = JSON.parse(data);

        try {
            switch (json.messageType) {
                case 'setId':
                    this.setId(json);
                    break;
                case 'updatePlayer':
                    this.updatePlayer(json);
                    break;
            }
        } catch (e) {
        }
    }

    setId({ id }) {
        this.id = id;
    }

    updatePlayer({ id, levelId, position, rotation, fire, attack }) {
        if (!id || id === this.id || levelId === this.scene.level.getLevelId()) {
            return;
        }

        if (!this.players[id]) {
            const setPlayer = (object) => {
                this.players[id] = object;
                return object;
            };

            setPlayer({ position: { set: () => null }, rotation: { set: () => null } });

            this.scene.units.createAnotherPlayer(player => setPlayer(player));
        }

        const player = this.players[id];
        player.position.set(position.x, position.y, position.z);
        player.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    send(player) {
        if (this.connection.readyState !== 1 || !this.id) {
            return;
        }

        if (player) {
            const playerRotation = player.object.rotation.toVector3();

            this.connection.send(JSON.stringify({
                id: this.id,
                levelId: this.scene.level.getLevelId(),
                position: player.position,
                rotation: {
                    x: Math.round(playerRotation.x),
                    y: Math.round(playerRotation.y),
                    z: Math.round(playerRotation.z),
                },
                fire: Number(player.isFire),
            }));
        }
    }
}