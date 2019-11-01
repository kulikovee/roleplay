var WebSocketServer = require('ws').Server,
    fs = require('fs');

var cfg = {
    ssl: true,
    port: 1337,
    ssl_key: __dirname + '/certs/privkey.pem',
    ssl_cert: __dirname + '/certs/fullchain.pem'
};

var httpServ = (cfg.ssl) ? require('https') : require('http');

var server = null;

var processRequest = function (req, res) {
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

var wss = new WebSocketServer({ server: server });


var connections = [];

wss.on('connection', function connection(ws) {
    connections.push(ws);

    ws.on('message', function(message) {
        var json = JSON.parse(message);
        connection.__id = json.id;

        connections
            .filter(function (c) { return c && c.__id !== json.id; })
            .forEach(function (c) { return c.send(message); } );
    });

    ws.on('close', function(connection) {
    });

    ws.send({ server: { version: 0.01 } });
});