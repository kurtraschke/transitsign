var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateStops;

function updateStops(db, callback) {
  var url = 'http://api.wmata.com/Bus.svc/json/JStops?api_key=' +
            keymaster.keyForAgency('WMATA');
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
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
    }
  ], callback);
}
