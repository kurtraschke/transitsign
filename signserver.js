var mongo = require('mongoskin');
var express = require('express');
var winston = require('winston');
var async = require('async');

var updates = require('./updates');

winston.cli();
winston.add(require('winston-mongoDB').MongoDB,
            {'db': 'testdb',
              'keepAlive': true});

function run() {
  var db = mongo.db('localhost:27017/testdb');

  var servermodules = [require('./servermods/cabi.js'),
        require('./servermods/rail.js'),
        require('./servermods/bus.js'),
        require('./servermods/wx.js')];

  async.series([
    function(callback) {
      async.forEachSeries(servermodules, function(item, callback) {
        if (typeof item.init === 'function') {
          item.init(db, callback);
        } else {
          callback(null);
        }
      }, callback);
    },

    function(callback) {
      var app = express.createServer();
      app.configure(function() {
        app.use(express.static(__dirname + '/static'));
      });

      var io = require('socket.io').listen(app,
          {'transports':
                ['websocket', 'flashsocket',
                 'htmlfile', 'xhr-polling',
                 'jsonp-polling'],
            'logger': winston
          });

      io.sockets.on('connection', function(socket) {
        for (var i = 0; i < servermodules.length; i++) {
          servermodules[i].configure(db, socket);
        }
      });

      app.listen(8000);
      updates.periodicUpdates(db);
    }

  ], function(err) {
    if (err) {
      winston.error('Error in initialization', err);
    }
  });
}

run();
