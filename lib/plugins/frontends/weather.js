var winston = require('winston');
var async = require('async');

var subscriptions = require('../../subscriptions');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    function(callback) {
      db.collection('wx_obs').ensureIndex({'station_id': 1}, callback);
    }
  ], callback);
}

function configure(db, socket) {

  socket.on('set weather', function(station_id, callback) {
    subscriptions.subscribe('US Weather', {'station_id': station_id}, db, socket);
    socket.set('wx', station_id);
    conditionalFetch(db, station_id, callback);
  });

  socket.on('get weather', function(callback) {
    socket.get('wx', function(err, station_id) {
      if (!err) {
        var collection = db.collection('wx_obs');
        collection.findItems({'station_id': station_id},
            {'temp_f': 1, 'weather': 1, '_id': 0},
            function(err, items) {
              if (!err) {
                callback({wx: items});
              } else {
                winston.error('Error querying for weather', err);
              }
            });
      } else {
        winston.error('Error getting weather station for socket', err);
      }
    });
  });

  socket.on('disconnect', function() {
    subscriptions.unsubscribe('US Weather', db, socket);
  });
}

function conditionalFetch(db, station_id, callback) {
  var collection = db.collection('wx_obs');
  async.waterfall([
    function(callback) {
      collection.count({'station_id': station_id}, callback);
    },
    function(count, callback) {
      if (count == 0) {
        winston.info('Performing conditional fetch for weather station ' +
                     station_id);
        require('../sources/weather')(db);
      } else {
        callback(null);
      }
    }
  ], callback);
}
