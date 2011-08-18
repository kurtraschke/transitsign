var async = require('async');
var winston = require('winston');

exports.periodicUpdates = periodicUpdates;

function startUpdates(name, updateFunction, args, interval) {
  var fun = function() {
    winston.debug('Performing periodic update for data source ' + name);
    updateFunction.apply(null, args);
  };
  fun();
  return setInterval(fun, interval);
}

function reportError(name) {
  return function(err) {
    if (err) {
      winston.error('Error updating ' + item.name, err);
    }
  };
}

function periodicUpdates(modules, db) {
  var timers = {};

  async.forEachSeries(modules,
      function(item, callback) {
        var module = require('./plugins/sources/' + item.name);
        var interval = item.interval * 1000;
        var args = item.parameters || [];
        timers[item.name] = startUpdates(item.name,
                                         module,
                                         args.concat([db,
                                                      reportError(item.name)]),
                                         interval);
        winston.info('Starting updates for data source ' + item.name);
        callback(null);
      },
      function(err) {
        if (err) {
          winston.error('Error starting periodic updates', err);
        }
      }
  );
}
