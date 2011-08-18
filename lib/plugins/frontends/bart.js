var winston = require('winston');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  db.collection('bart_trains').ensureIndex({'stationAbbr': 1}, callback);
}

function configure(db, socket) {
 socket.on('get bart trains', function(abbr, minutes, callback) {
    var collection = db.collection('bart_trains');
    collection.findItems({'stationAbbr': abbr,
          'minutes': {'$gte': minutes}
                         },
        {'hexcolor': 1, 'length': 1, 'destinationName': 1, 'minutes': 1, '_id': 0},
        {'sort': {'minutes': 1}},
        function(err, items) {
          if (!err) {
            callback({trains: items});
          } else {
            winston.error('Error querying for BART predictions', err);
          }
        });
  });

  socket.on('get bart incidents', function(callback) {
    var collection = db.collection('bart_incidents');
    collection.findItems({},
        {'description': 1, 'type': 1, '_id': 0},
        function(err, items) {
          if (!err) {
            callback({incidents: items});
          } else {
            winston.error('Error querying for BART incidents', err);
          }
        });
  });
}
