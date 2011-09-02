var async = require('async');
var winston = require('winston');

var fetch = require('../fetch');

module.exports = updatePBSC;

function updatePBSC(systems, db, callback) {
  async.forEachSeries(systems,
      function(item, callback) {
        winston.info('Updating PBSC bikeshare system ' + item.name);
        fetchPBSC(db, item.url, item.name, callback);
      }, callback);
}

function fetchPBSC(db, url, systemName, callback) {
  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(data, callback) {
      var stationsOut = Array();

      if (typeof data.station !== 'undefined') {
        var stations = data.station;
        for (var i = 0; i < stations.length; i++) {
          var station = stations[i];

          var bikes = parseInt(station.nbBikes);
          var docks = parseInt(station.nbEmptyDocks);

          var stationOut = {
            'system': systemName,
            'id': station.id,
            'name': station.name,
            'bikes': bikes,
            'docks': docks,
            'size': bikes + docks,
            'available': (station.installed === 'true' &&
                          station.locked === 'false')
          };
          stationsOut.push(stationOut);
        }
      }

      callback(null, stationsOut);
    },
    function(stationsOut, callback) {
      var collection = db.collection('bikeshare');

      async.series(
          [
           function(callback) {
             collection.remove({'system': systemName},
                               {'safe': true}, callback);
           },
           function(callback) {
             if (stationsOut.length > 0) {
               collection.insert(stationsOut, {'safe': true}, callback);
             }
           }
          ],
          function(err, results) {
            callback(err);
          });
    }
  ], callback);
}
