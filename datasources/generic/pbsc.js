var rlrequest = require('../rlrequest');

var xml2js = require('xml2js');
var async = require('async');

exports.updatePBSC = updatePBSC;

function updatePBSC(db, url, systemName, callback) {
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            callback(error, body);
          });
    },
    function(body, callback) {
      var parser = new xml2js.Parser();
      parser.on('end', function(result) {
        callback(null, result);
      });
      parser.on('error', function(err) {
        callback(err);
      });
      parser.parseString(body);
    },
    function(data, callback) {
      var stationsOut = Array();
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
             collection.insert(stationsOut, {'safe': true}, callback);
           }
          ],
          function(err, results) {
            callback(err);
          });
    }
  ], callback);
}
