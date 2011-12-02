var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');
var fetchStopInformation = require('./stops');

module.exports = updateCUMTDPredictions;

function updateCUMTDPredictions(agency, stopID, db, callback) {
  var url = URLForStop(keymaster.keyForAgency('CUMTD'), stopID);
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
      if (parsed.status.msg != 'ok') {
        callback({'error': parsed.status});
      } else {
        var departures = parsed.departures;
        async.map(departures, function(item, callback) {
          var departure = item;
          async.waterfall([
            function(callback) {
              async.parallel({
                'destinationName': function(callback) {
                  nameForStop(departure.destination.stop_id, db, callback);
                },
                'stopName': function(callback) {
                  nameForStop(departure.stop_id, db, callback);
                }
              }, callback);
            },
            function(stopNames, callback) {
              var trip = {'Agency': agency,
                'DirectionText': departure.trip.direction,
                'DestinationName': stopNames.destinationName,
                'StopName': stopNames.stopName,
                'Minutes': departure.expected_mins,
                'RouteID': departure.headsign,
                'StopID': departure.stop_id,
                'VehicleID': departure.vehicle_id};
              callback(null, trip);
            }
          ], callback);
        }, callback);
      }
    },
    function(tripsOut, callback) {
      var collection = db.collection('bus_predictions');

      async.series(
          [
           function(callback) {
             collection.remove({'StopID': stopID,
               'Agency': agency}, {'safe': true}, callback);
           },
           function(callback) {
             if (tripsOut.length > 0) {
               collection.insert(tripsOut, {'safe': true}, callback);
             } else {
               callback(null);
             }
           }
          ],
          function(err, results) {
            callback(err);
          });
    }
  ], callback);
}

function URLForStop(key, stopID) {
  var version = 'v2.0';
  var format = 'json';
  var baseURL = 'http://developer.cumtd.com/api/' + version + '/' +
                format + '/GetDeparturesByStop';

  var out = baseURL + '?key=' + key + '&stop_id=' + stopID;
  return out;
}

function nameForStop(stop_id, db, callback) {
  var collection = db.collection('cumtd_stops');

  collection.findOne({'stop_id': stop_id}, function(error, stopInformation) {
    if (error) {
      callback(error);
    } else if (stopInformation) {
      console.log(stopInformation);
      callback(null, stopInformation.stop_name);
    } else {
      fetchStopInformation(stop_id, db, callback);
    }
  });
}
