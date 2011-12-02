var winston = require('winston');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  db.collection('mbta_trains').ensureIndex({'PlatformKey': 1}, callback);
}

function configure(db, socket) {
  socket.on('get mbta trains', function(platformKeys, minutes, callback) {
    var collection = db.collection('mbta_trains');
    collection.findItems({'PlatformKey': {'$in': platformKeys},
                           'Minutes': {'$gte': minutes},
                           'Revenue': 'Revenue'
                         },
        {'Line': 1, 'Destination': 1, 'Minutes': 1, 'PlatformKey': 1, '_id': 0},
        {'sort': {'Minutes': 1}},
        function(err, items) {
          if (!err) {
            callback({trains: items});
          } else {
            winston.error('Error querying for MBTA predictions', err);
          }
        });
  });

  socket.on('get mbcr trains', function(stop, callback) {
    var collection = db.collection('mbta_cr_trains');
    collection.findItems({'Stop': stop,
      'Destination': {'$ne': stop}
    },
    {'_id': 0},
    {'sort': {'Time': 1}},
    function(err, items) {
      if (!err) {
        callback({trains: items});
      } else {
        winston.error('Error querying for MBCR predictions', err);
      }
    });
  });

}
