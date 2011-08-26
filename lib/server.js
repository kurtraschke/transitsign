var mongo = require('mongoskin');
var express = require('express');
var winston = require('winston');
var async = require('async');
var ObjectID = require('mongodb/lib/mongodb/bson/bson').ObjectID;

var updates = require('./updates');
var keymaster = require('./keymaster');

exports.run = run;

function run(config) {
  var logLevels = {
    levels:
        {
          debug: 1,
          info: 2,
          warn: 3,
          error: 4
        },
    colors:
        {
          info: 'green',
          warn: 'yellow',
          debug: 'blue',
          error: 'red'
        }
  };

  winston.setLevels(logLevels.levels);
  winston.addColors(logLevels.colors);

  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console,
              {level: 'warn',
                colorize: true,
                handleExceptions: true});
  winston.add(require('winston-mongoDB').MongoDB,
              {db: config.db.db,
                host: config.db.host,
                port: config.db.port,
                keepAlive: true,
                level: 'debug',
                handleExceptions: true});

  //winston.handleExceptions();

  keymaster.importKeys(config.keyFile);

  var db = mongo.db(config.db.host + ':' + config.db.port + '/' + config.db.db);

  async.series([
    function(callback) {
      db.executeDbCommand({'convertToCapped': 'log', size: 5000000, max: 20000}, callback);
    },
    function(callback) {
      db.collection('log').ensureIndex({'_id': -1}, callback);
    }], function(error) {
    if (error) {
      winston.error('error configuring log collection', error);
    }
  }
  );

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

        socket.on('get logs', function(level, quantity, filter, lastID, callback) {
          var collection = db.collection('log');
          var levels = [];

          var targetLevel = logLevels.levels[level];
          var levelNames = Object.keys(logLevels.levels);

          for (var i = 0; i < levelNames.length; i++) {
            var levelValue = logLevels.levels[levelNames[i]];
            if (levelValue >= targetLevel) {
              levels.push(levelNames[i]);
            }
          }

          var selector = {'level': {'$in': levels}};

          var options = {'sort': {'_id': -1}};

          if (quantity != null) {
            options['limit'] = quantity;

          }

          if (lastID != null) {
            selector['_id'] = {'$gt': ObjectID(lastID)};
          }

          if (filter != null && filter.length > 0) {
            selector['message'] = {'$regex': filter};
          }

          collection.findItems(selector,
              {'_id': 1, 'level': 1, 'message': 1, 'meta': 1},
              options,
              function(error, items) {
                if (!error) {
                  callback(items);
                }
              }
          );

        });
      });

      app.listen(config.listenport);
      timers = updates.startUpdates(config.sources, db);
    }
  ], function(error) {
    if (err) {
      winston.error('Error in initialization', error);
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
