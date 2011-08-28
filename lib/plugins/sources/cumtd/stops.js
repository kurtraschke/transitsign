var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = loadCUMTDStops;

function loadCUMTDStops(db, callback) {
  var key = keymaster.keyForAgency('CUMTD');
  var version = "v1.0";
  var format = "json";
  var url = "http://developer.cumtd.com/api/"+version+"/"+format+"/stops.getList?key=" + key;
  
  async.waterfall([
      function(callback) {
        rlrequest.request_limited({uri:url},
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
        if (parsed.stat != 'ok') {
          callback({'error': parsed.err});
        } else {
          var collection = db.collection('cumtd_stops');
        async.series(
            [
              function(callback) {
                collection.remove({}, {'safe': true}, callback);
              },
              function(callback) {
                collection.insert(parsed.stops, {'safe': true}, callback);
              },
              function(callback) {
                collection.ensureIndex({'code': 1}, callback);
              },
              function(callback) {
                collection.ensureIndex({'stop_id': 1}, callback);
              }
            ], callback);
      }
    }
  ], callback);
}