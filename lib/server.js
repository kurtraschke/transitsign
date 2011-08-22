var mongo = require('mongoskin');
var express = require('express');
var winston = require('winston');
var async = require('async');

var updates = require('./updates');
var keymaster = require('./keymaster');

exports.run = run;

function run(config) {
  winston.cli();
  winston.add(require('winston-mongoDB').MongoDB,
      {'db': config.db.db,
        'host': config.db.host,
        'port': config.db.port,
        'keepAlive': true});

  keymaster.importKeys(config.keyFile);

  var db = mongo.db(config.db.host + ':' + config.db.port + '/' + config.db.db);

  var frontends = [];
  var timers, io;

  for (var i = 0; i < config.frontends.length; i++) {
    frontends.push(require(config.frontends[i]));
  }

  async.series([
    function(callback) {
      async.forEachSeries(frontends, function(item, callback) {
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
        app.use(express.static(__dirname + '/../static'));
      });

      io = require('socket.io').listen(app,
          {'transports':
                ['websocket', 'flashsocket',
                 'htmlfile', 'xhr-polling',
                 'jsonp-polling'],
            'logger': winston
          });

      io.sockets.on('connection', function(socket) {
        for (var i = 0; i < frontends.length; i++) {
          frontends[i].configure(db, socket);
        }
      });

      app.listen(config.listenport);
      timers = updates.startUpdates(config.sources, db);
    }
  ], function(err) {
    if (err) {
      winston.error('Error in initialization', err);
    }
  });

  process.on('SIGINT', function() {
    winston.warn('Shutting down.');
    updates.stopUpdates(timers);

    var clients = io.sockets.clients();


    for (var i = 0; i < clients.length; i++) {
      var client = clients[i];
      client.disconnect();
    }
    process.exit(0);
  });

}
