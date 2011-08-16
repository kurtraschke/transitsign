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
      db.collection('stop_subscriptions').remove({}, {'safe': true}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('subscribe buses', function(buses, callback) {
    subscribeStops(db, socket, buses);
  });

  socket.on('get buses', function(stops, minutes, callback) {
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
  });

  socket.on('disconnect', function() {
    unsubscribeStops(db, socket);
  });
}


function subscribeStops(db, socket, stops) {
  var collection = db.collection('stop_subscriptions');
  if (stops instanceof Array) {
    for (var i = 0; i < stops.length; i++) {
      collection.update(stops[i],
          {'$push': {'sockets': socket.id},
            '$inc': {'subscriberCount': 1}},
          {'upsert': true});
    }
  }
}

function unsubscribeStops(db, socket) {
  var collection = db.collection('stop_subscriptions');

  collection.update({'sockets': socket.id},
      {'$pull': {'sockets': socket.id},
        '$inc': {'subscriberCount': -1}},
      {'upsert': true, 'multi': true});

}
