const WebSocketServer = require('ws').Server,
    fs = require('fs');

const cfg = {
    ssl: true,
    port: 1337,
    ssl_key: __dirname + '/certs/privkey.pem',
    ssl_cert: __dirname + '/certs/fullchain.pem'
};

const httpServ = (cfg.ssl) ? require('https') : require('http');

let server = null;

const processRequest = function (req, res) {
    res.writeHead(200);
    res.end("All glory to WebSockets!\n");
};

if (cfg.ssl) {
    server = httpServ.createServer({
        key: fs.readFileSync(cfg.ssl_key),
        cert: fs.readFileSync(cfg.ssl_cert)
    }, processRequest).listen(cfg.port);
} else {
    server = httpServ.createServer(processRequest).listen(cfg.port);
}

const wss = new WebSocketServer({ server: server });
const connections = [];
let idSeq = 0;

wss.on('connection', function connection(ws) {
    console.log('New connection');
    connections.push(ws);

    ws.on('message', function(message) {
        const json = JSON.parse(message);

        if (json.id) {
            ws.__id = json.id;
        }

        if (json.levelId) {
            ws.__levelId = json.levelId;
        }

        if (!ws.__id) {
            console.log('No id set for the connection', ws);
        }

        const backMessage = JSON.stringify({ ...json, messageType: 'updatePlayer' });
        connections
            .filter(c => c && c.__id && c.__id !== json.id && c.__levelId === json.levelId)
            .forEach(c => c.send(backMessage));
    });

    ws.on('close', function(connection) {
    });

    ws.send(JSON.stringify({ messageType: 'setId', server: { version: 0.01 }, id: ++idSeq }));
});