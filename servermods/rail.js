var winston = require('winston');

var wmatastatic = require('../datasources/wmatastatic');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  wmatastatic.updateStations(db, callback);
}

function configure(db, socket) {
  socket.on('set trains', function(rtu, callback) {
    var collection = db.collection('stations');
    collection.findOne({'Code': rtu},
        function(err, station) {
          if (!err) {
            var rtus = [rtu];

            if (station.StationTogether1 !== '') {
              rtus.push(station.StationTogether1);
            }

            if (station.StationTogether2 !== '') {
              rtus.push(station.StationTogether2);
            }

            socket.set('rtus', rtus);
            callback({'name': station.Name});

          } else {
            winston.error('Error getting rail station information', err);
          }
        });
  });


  socket.on('get trains', function(minutes, callback) {
    socket.get('rtus', function(err, rtus) {
      if (!err) {
        var collection = db.collection('trains');
        collection.findItems({'LocationCode': {'$in': rtus},
                               'Min': {'$gte': minutes}},
            {'Car': 1, 'DestinationName': 1, 'Line': 1, 'Min': 1, '_id': 0},
            {'sort': {'Min': 1}},
            function(err, items) {
              if (!err) {
                callback({trains: items});
              } else {
                winston.error('Error querying for rail predictions', err);
              }
            });
      } else {
        winston.error('Error getting rail information for socket', err);
      }
    });
  });

  socket.on('get incidents', function(callback) {
    var collection = db.collection('incidents');
    collection.findItems({},
        {'Description': 1, 'LinesAffectedArr': 1, '_id': 0},
        function(err, items) {
          if (!err) {
            callback({incidents: items});
          } else {
            winston.error('Error querying for rail incidents', err);
          }
        });
  });
}
