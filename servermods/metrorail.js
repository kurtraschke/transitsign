var winston = require('winston');
var async = require('async');

var wmatastatic = require('../datasources/wmatastatic');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    function(callback) {
      wmatastatic.updateStations(db, callback);
    },
    function(callback) {
      db.collection('metrorail_stations').ensureIndex({'Code': 1}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('get metrorail information', function(rtu, callback) {
    var collection = db.collection('metrorail_stations');
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

            callback({'name': station.Name, 'rtus': rtus});

          } else {
            winston.error('Error getting rail station information', err);
          }
        });
  });


  socket.on('get metrorail trains', function(rtus, minutes, callback) {
    var collection = db.collection('metrorail_trains');
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
  });

  socket.on('get metrorail incidents', function(callback) {
    var collection = db.collection('metrorail_incidents');
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
