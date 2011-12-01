var async = require('async');
var mongo = require('mongoskin');
var winston = require('winston');

var keymaster = require('./keymaster');
var logging = require('./logging');

exports.run = run;

var serverModules = [require('./fetcher'), require('./frontend')];

function run(config) {
  logging.configureLogging();
  keymaster.importKeysEnv();
  var db = mongo.db(config.db.host + ':' + config.db.port + '/' +
                    config.db.db + '?auto_reconnect');
  async.series([
    function(callback) {
      db.collectionNames(function(error, names) {
        if (error) {
          callback(error);
        } else {
          if (names.indexOf(config.db.db + '.log') < 0) {
            db.createCollection('log',
                                {'capped': true, size: 10000000,
                  max: 20000, 'autoIndexId': true},
                                callback);
          } else {
            callback(null);
          }
        }
      });
    },
    function(callback) {
      logging.configureDBLogging(config);
      callback(null);
    },
    function(callback) {
      async.forEach(serverModules,
          function(item, callback) {
            item.start(config, db, callback);
          },
          callback);
    },
    function(callback) {
      process.on('SIGINT', function() {
        winston.warn('Shutting down.');

        async.forEach(serverModules,
            function(item, callback) {
              item.stop(callback);
            },
            function(error) {
              if (error) {
                winston.error('Error in shutdown', {'error': error});
                process.exit(1);
              } else {
                process.exit(0);
              }
            });
      });
      callback(null);
    }
  ],
  function(error) {
    if (error) {
      winston.error('Error in startup', {'error': error});
    }
  });
}

