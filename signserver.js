var mongo = require('mongoskin');
var express = require('express');
var io = require('socket.io');

var updates = require('./updates');

var db = mongo.db('localhost:27017/testdb');

var app = express.createServer();

app.configure(function() {
    app.use(express.static(__dirname + '/static'));
});

var io = require('socket.io').listen(app);

io.configure(function () {
    io.set('transports', ['websocket', 'flashsocket', 'htmlfile','xhr-polling', 'jsonp-polling']);
});

var servermodules = [require("./servermods/cabi.js"),
                     require("./servermods/rail.js"),
                     require("./servermods/bus.js"),
                     require("./servermods/wx.js")]

io.sockets.on('connection', function (socket) {
    for (var i=0; i < servermodules.length; i++) {
        servermodules[i].configure(db, socket);
    }
});

app.listen(8000);
updates.periodicUpdates(db);