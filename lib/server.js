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

