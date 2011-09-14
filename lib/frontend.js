var async = require('async');
var express = require('express');
var winston = require('winston');

module.exports = function() {
  var io;

  function makeLogger(logger) {
    var newLogger = {};
    var levels = Object.keys(logger.levels);

    for (var i = 0; i < levels.length; i++) {
      var level = levels[i];
      newLogger[level] = function(level) {
        return function(message) {
          var args = Array.prototype.slice.call(arguments, 1);
          var meta = args.length < 1 ? null : args;
          logger.log(level, message, meta, null);
        };
      } (level);
    }
    return newLogger;
  }

  return {
    start: function(config, db, callback) {
      var frontends = [];

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
                'logger': makeLogger(winston)
              });

          io.sockets.on('connection', function(socket) {
            for (var i = 0; i < frontends.length; i++) {
              frontends[i].configure(db, socket);
            }
          });

          app.listen(process.env.PORT || config.listenport);
          callback(null);
        }
      ], callback);
    },
    stop: function(callback) {
      var clients = io.sockets.clients();

      for (var i = 0; i < clients.length; i++) {
        var client = clients[i];
        client.disconnect();
      }
      callback(null);
    }
  };
}();
