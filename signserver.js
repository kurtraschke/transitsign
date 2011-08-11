var mongo = require('mongoskin');
var express = require('express');
//var io = require('socket.io');
var winston = require('winston');

var updates = require('./updates');

winston.cli();
winston.add(require('winston-mongoDB').MongoDB, {'db': 'testdb'});

function run() {
    var db = mongo.db('localhost:27017/testdb');

    var app = express.createServer();
    app.configure(function() {
        app.use(express.static(__dirname + '/static'));
    });

    var io = require('socket.io').listen(app, 
                                         {'transports': ['websocket', 'flashsocket', 'htmlfile',
                                                         'xhr-polling', 'jsonp-polling'],
                                          'logger': winston,
                                         });
    
    var servermodules = [require("./servermods/cabi.js"),
                         require("./servermods/rail.js"),
                         require("./servermods/bus.js"),
                         require("./servermods/wx.js")];
    
    for (var i=0; i < servermodules.length; i++) {
        //servermodules[i].init(db);
    }

    io.sockets.on('connection', function (socket) {
        for (var i=0; i < servermodules.length; i++) {
            servermodules[i].configure(db, socket);
        }
    });
    
    app.listen(8000);
    updates.periodicUpdates(db);
    
}

run();