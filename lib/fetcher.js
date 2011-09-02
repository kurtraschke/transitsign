var async = require('async');
var winston = require('winston');

module.exports = function() {
  var timers = {};

  function startTimer(name, updateFunction, args, interval) {
    var fun = function() {
      winston.debug('Performing periodic update for data source ' + name);
      updateFunction.apply(null, args);
    };
    fun();
    return setInterval(fun, interval);
  }

  function reportError(item) {
    return function(err) {
      if (err) {
        winston.error('Error updating ' + item.name, err);
      }
    };
  }

  return {
    start: function(config, db, callback) {
      var modules = config.sources;
      for (var i = 0; i < modules.length; i++) {
        var theModule = modules[i];

        var moduleFile = require('./plugins/sources/' + theModule.name);
        var interval = theModule.interval * 1000;
        var args = theModule.parameters || [];
        timers[theModule.name] = startTimer(theModule.name,
            moduleFile,
            args.concat([db, reportError(theModule)]),
            interval);
        winston.info('Starting updates for data source ' + theModule.name);
      }
      callback(null);
    },

    stop: function(callback) {
      var timerNames = Object.keys(timers);

      for (var i = 0; i < timerNames.length; i++) {
        var timerName = timerNames[i];
        winston.info('Stopping updates for data source ' + timerName);
        clearInterval(timers[timerName]);
      }
      callback(null);
    }
  };

}();






