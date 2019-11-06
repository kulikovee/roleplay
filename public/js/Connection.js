export default class Connection {
    /**
     * @param {Scene} scene
     * @param {string|number} ip
     * @param {string|number} port
     * @param {boolean} isSecure
     */
    constructor(scene, ip = 'localhost', port = '1337', isSecure = true) {
        this.send = this.send.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.setId = this.setId.bind(this);
        this.updatePlayer = this.updatePlayer.bind(this);

        this.scene = scene;

        const WebSocket = window.WebSocket || window.MozWebSocket;

        this.connection = new WebSocket(`${isSecure ? 'wss' : 'ws'}://${ip}:${port}`);
        this.connection.onopen = () => console.log('open connection');
        this.connection.onerror = (error) => console.log('error connection', error);
        this.connection.onmessage = this.onMessage;
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

    updatePlayer({ id, levelId, position, rotation, fire }) {
        if (!id || id === this.id || levelId === this.scene.level.getLevelId()) {
            return;
        }

        if (!this.scene.players[id]) {
            this.scene.createAnotherPlayer(id);
        }

        const player = this.scene.players[id];
        player.position.set(position.x, position.y, position.z);
        player.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    send(player) {
        if (this.connection.readyState !== 1 || !this.id) {
            return;
        }

        if (player) {
            this.connection.send(JSON.stringify({
                id: this.id,
                levelId: this.scene.level.getLevelId(),
                position: player.position,
                rotation: player.object.rotation.toVector3(),
                fire: player.isFire,
            }));
        }
    }
}