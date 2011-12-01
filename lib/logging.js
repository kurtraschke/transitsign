var winston = require('winston');

exports.logLevels = logLevels;
exports.configureLogging = configureLogging;

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


function configureLogging(config) {
  winston.setLevels(logLevels.levels);
  winston.addColors(logLevels.colors);
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console,
              {level: 'info',
                colorize: true,
                handleExceptions: true});
  //winston.handleExceptions();
}
