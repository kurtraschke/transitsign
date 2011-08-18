var async = require('async');

var rlrequest = require('../rlrequest');
var wmata_api_key = require('./wmatakey').api_key;

exports.updateStations = updateStations;
exports.updateStops = updateStops;

function updateStations(db, callback) {
  var url = 'http://api.wmata.com/Rail.svc/json/JStations?api_key=' +
            wmata_api_key;
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
                        }], callback);
        } else {
          callback(err);
        }
      });
}

function updateStops(db, callback) {
  var url = 'http://api.wmata.com/Bus.svc/json/JStops?api_key=' +
            wmata_api_key;
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
                        }], callback);
        } else {
          callback(err);
        }
      });
}
