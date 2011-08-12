var winston = require('winston');
var async = require('async');

var wmatastatic = require('../datasources/wmatastatic');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    //We don't currently use the stops collection,
    //so there's no reason to update it.
    /*function(callback) {
      wmatastatic.updateStops(db, callback);
    },*/
    function(callback) {
      db.collection('stop_subscriptions').remove({},{'safe': true}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('set buses', function(buses, callback) {
    incrementStopCounts(db, buses, 1);
    socket.set('buses', buses);
  });

  socket.on('get buses', function(callback) {
    socket.get('buses', function(err, stops) {
      if (!err) {
        var minutes = 1; //TODO: make this a config parameter in the client.
        var collection = db.collection('bus_predictions');
        collection.findItems({'$or': stops, 'Minutes': {'$gte': minutes}},
            {'Agency': 1, 'RouteID': 1, 'StopName': 1, 'DirectionText': 1,
              'StopID': 1, 'Minutes': 1, '_id': 0},
            {'sort': {'Minutes': 1}},
            function(err, items) {
              if (!err) {
                callback({buses: items});
              } else {
                winston.error('Error querying for bus predictions', err);
              }
            });
      } else {
        winston.error('Error getting bus stop list for socket', err);
      }
    });
  });

  socket.on('disconnect', function() {
    socket.get('buses', function(err, buses) {
      incrementStopCounts(db, buses, -1);
    });
  });
}


function incrementStopCounts(db, stops, incvalue) {
  var collection = db.collection('stop_subscriptions');
  if (stops instanceof Array) {
    for (var i = 0; i < stops.length; i++) {
      collection.update(stops[i],
                        {'$inc': {subscriberCount: incvalue}},
                        {'upsert': true});
    }
  }
}
