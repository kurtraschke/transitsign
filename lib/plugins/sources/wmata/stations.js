var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateStations;

function updateStations(db, callback) {
  var url = 'http://api.wmata.com/Rail.svc/json/JStations?api_key=' +
            keymaster.keyForAgency('WMATA');

  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
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
    }
  ], callback);
}
