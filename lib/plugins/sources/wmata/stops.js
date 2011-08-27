var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateStops;

function updateStops(db, callback) {
  var url = 'http://api.wmata.com/Bus.svc/json/JStops?api_key=' +
            keymaster.keyForAgency('WMATA');
  rlrequest.request_limited({uri: url},
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var parsed = JSON.parse(body);
          var stops = parsed.Stops;
          var collection = db.collection('metrobus_stops');

          async.series([
                        function(callback) {
              collection.remove({},{'safe': true}, callback);
                        },
                        function(callback) {
              collection.insert(stops, {'safe': true}, callback);
                        },
                       function(callback) {
              collection.ensureIndex({'StopID': 1}, callback);
                       }], callback);
        } else {
          callback({'error': error, 'response': response});
        }
      });
}
