
module.exports = function(app, server) {
    var socketIO = require('socket.io').listen(server);
    global.socketIO = socketIO;

    socketIO.set("transports", ["xhr-polling"]);

    var redis_io = require('socket.io-redis');
    var redis = require("redis");

    io.adapter(redis_io({host: "172.21.42.150", port: 6379 }));

    socketIO.sockets.on('connection', function (socket) {

        socket.on('disconnect', function () {
        });

    });

}
