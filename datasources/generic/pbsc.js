var rlrequest = require('../rlrequest');

var xml2js = require('xml2js');
var async = require('async');

exports.updatePBSC = updatePBSC;

function updatePBSC(db, url, callback) {
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
      parser.parseString(body);
    },
    function(data, callback) {
      var stationsOut = Array();
      var stations = data.station;

      for (var i = 0, l = stations.length; i < l; i++) {
        var station = stations[i];

        station.nbBikes = parseInt(station.nbBikes);
        station.nbEmptyDocks = parseInt(station.nbEmptyDocks);

        station.stationSize = station.nbBikes + station.nbEmptyDocks;

        stationsOut.push(station);
      }
      callback(null, stationsOut);
    },
    function(stationsOut, callback) {
      var collection = db.collection('cabi');

      async.series(
          [
           function(callback) {
             collection.remove({},{'safe': true}, callback);
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
