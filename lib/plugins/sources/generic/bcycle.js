var async = require('async');

var rlrequest = require('../rlrequest');

module.exports = updateBcycle;

function updateBcycle(db, callback) {
  var systemName = 'B-cycle';
  async.waterfall([
    function(callback) {
      var bcycleAPI = 'http://api.bcycle.com/services/mobile.svc/ListKiosks';
      rlrequest.request_limited({uri: bcycleAPI},
          function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var parsed = JSON.parse(body);
              callback(null, parsed);
            } else {
              callback({'error': error, 'response': response});
            }
          });
    },
    function(parsed, callback) {
      var stations = parsed.d.list;

      var stationsOut = Array();

      for (var i = 0; i < stations.length; i++) {
        var station = stations[i];
        var stationOut = {
          'system': systemName,
          'bikes': station.BikesAvailable,
          'docks': station.DocksAvailable,
          'size': station.totalDocks,
          'id': station.Id + '',
          'name': station.Name,
          'available': (station.Status === 'Active')
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
