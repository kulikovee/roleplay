export default class Connection {
    constructor(scene, ip = 'localhost', port = '1337', isSecure = true) {
        this.send = this.send.bind(this);
        this.onMessage = this.onMessage.bind(this);

        this.scene = scene;

        const WebSocket = window.WebSocket || window.MozWebSocket;

        this.id = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2);

        this.connection = new WebSocket(`${isSecure ? 'wss' : 'ws'}://${ip}:${port}`);
        this.connection.onopen = () => console.log('open connection');
        this.connection.onerror = (error) => console.log('error connection', error);
        this.connection.onmessage = this.onMessage;
    }

    onMessage({ data }) {
        try {
            const { id, levelId, position, rotation, fire } = JSON.parse(data);

            if (!id || id === this.id || levelId === this.scene.level.getLevelId()) {
                return;
            }

            if (!this.scene.players[id]) {
                this.scene.createAnotherPlayer(id);
            }

            const player = this.scene.players[id];
            player.position.set(position.x + 1, position.y, position.z);
            player.rotation.set(rotation.x, rotation.y, rotation.z);
        } catch (e) {
        }
    }

    send(player) {
        if (this.connection.readyState !== 1) {
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