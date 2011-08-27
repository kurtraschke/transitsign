var winston = require('winston');
var async = require('async');

var subscriptions = require('../../subscriptions');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    function(callback) {
      db.collection('bus_predictions').ensureIndex({'Agency': 1,
        'StopID': 1}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('subscribe buses', function(buses, callback) {
    subscriptions.subscribe('Bus', buses, db, socket);
  });

  socket.on('get buses', function(stops, minutes, callback) {
    var collection = db.collection('bus_predictions');
    collection.findItems({'$or': stops, 'Minutes': {'$gte': minutes}},
        {'Agency': 1, 'RouteID': 1, 'StopName': 1, 'DirectionText': 1,
          'DestinationName': 1, 'StopID': 1, 'Minutes': 1, '_id': 0},
        {'sort': {'Minutes': 1}},
        function(err, items) {
          if (!err) {
            callback({buses: items});
          } else {
            winston.error('Error querying for bus predictions', err);
          }
        });
  });

  socket.on('disconnect', function() {
    subscriptions.unsubscribe('Bus', db, socket);
  });
}
