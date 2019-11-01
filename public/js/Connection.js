export default class Connection {
    constructor(scene, ip = 'localhost', port = '1337') {
        this.scene = scene;
        this.ip = ip;
        this.port = port;

        const WebSocket = window.WebSocket || window.MozWebSocket;

        this.id = Math.random().toString(36) + Math.random().toString(36);
        this.connection = new WebSocket(`wss://${ip}:${port}`);

        this.connection.onopen = () => {
            console.log('open connection');
        };

        this.connection.onerror = (error) => {
            console.log('error connection', error);
        };

        this.connection.onmessage = (message) => {
            try {
                const json = JSON.parse(message.data);

                if (!scene.players[json.id]) {
                    scene.createAnotherPlayer(json.id);
                }

                const player = scene.players[json.id];
                player.position.set(json.position.x + 1, json.position.y, json.position.z);
                player.rotation.set(json.rotation.x, json.rotation.y, json.rotation.z);
            } catch (e) {
            }
        };

        this.send = this.send.bind(this);
    }

    send(player) {
        if (this.connection.readyState !== 1) {
            return;
        }

        if (player) {
            this.connection.send(JSON.stringify({
                id: this.id,
                position: player.position,
                rotation: player.object.rotation.toVector3(),
                fire: player.isFire,
            }));
        }
    }
}