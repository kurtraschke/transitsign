var winston = require('winston');
var winstonMongoDB = require('winston-mongoDB');

exports.logLevels = logLevels;
exports.configureLogging = configureLogging;
exports.configureDBLogging = configureDBLogging;

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

function configureDBLogging(config) {
  winston.add(winstonMongoDB.MongoDB,
      {db: config.db.db,
                host: config.db.host,
                port: config.db.port,
                keepAlive: true,
                level: 'debug',
                handleExceptions: true});
}
