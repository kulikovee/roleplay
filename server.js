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

wss.on('connection', function connection(ws) {
    console.log('New connection');
    connections.push(ws);

    ws.on('message', function(message) {
        const json = JSON.parse(message);
        ws.__id = json.id;

        if (!ws.__id) {
            console.log('Not id for ws', ws);
        }

        connections
            .filter(function (c) { return c && c.__id && c.__id !== json.id; })
            .forEach(function (c) { return c.send(message); } );
    });

    ws.on('close', function(connection) {
    });

    ws.send(JSON.stringify({ server: { version: 0.01 } }));
});