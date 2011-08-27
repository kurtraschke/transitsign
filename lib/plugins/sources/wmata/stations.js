var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateStations;

function updateStations(db, callback) {
  var url = 'http://api.wmata.com/Rail.svc/json/JStations?api_key=' +
            keymaster.keyForAgency('WMATA');
  rlrequest.request_limited({uri: url},
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var parsed = JSON.parse(body);
          var stations = parsed.Stations;
          var collection = db.collection('metrorail_stations');

          async.series([
                        function(callback) {
              collection.remove({},{'safe': true}, callback);
                        },
                        function(callback) {
              collection.insert(stations, {'safe': true}, callback);
                        },
                       function(callback) {
              collection.ensureIndex({'Code': 1}, callback);
                       }], callback);
        } else {
          callback({'error': error, 'response': response});
        }
      });
}