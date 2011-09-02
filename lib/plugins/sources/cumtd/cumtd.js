var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');
var timezone = require('../../../ext/timezone');

module.exports = updateCUMTDPredictions;

function updateCUMTDPredictions(agency, stopID, db, callback) {
  var url = URLForStop(keymaster.keyForAgency('CUMTD'), stopID);
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
      if (parsed.stat != 'ok') {
        callback({'error': parsed.err});
      } else {
        var departures = parsed.departures;
        var now = new Date();
        async.map(departures, function(item, callback) {
          var departure = item;
          async.waterfall([
            function(callback) {
              async.parallel({
                'destinationName': function(callback) {
                  nameForStop(departure.destination.stop_id, db, callback);
                },
                'directionName': function(callback) {
                  nameForStop(departure.stop_id, db, callback);
                }
              }, callback);
            },
            function(stopNames, callback) {
              var time = delta(parseTime(departure.expected), now);

              var trip = {'Agency': agency,
                'DirectionText': departure.direction,
                'DestinationName': stopNames.destinationName,
                'StopName': stopNames.directionName,
                'Minutes': time,
                'RouteID': departure.route,
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
  var version = 'v1.0';
  var format = 'json';
  var baseURL = 'http://developer.cumtd.com/api/' + version + '/' +
                format + '/departures.getListByStop';

  var out = baseURL + '?key=' + key + '&stop_id=' + stopID;
  return out;
}

function nameForStop(stop_id, db, callback) {
  var collection = db.collection('cumtd_stops');

  collection.findOne({'stop_id': stop_id}, function(error, stopInformation) {
    if (error) {
      callback(error);
    } else {
      callback(null, stopInformation.stop_name);
    }
  });
}

function parseTime(timeString) {
  var year = timeString.substring(0, 4);
  var month = timeString.substring(5, 7);
  var day = timeString.substring(8, 10);
  var hour = timeString.substring(11, 13);
  var minute = timeString.substring(14, 16);
  var second = timeString.substring(17);

  var d = new timezone.timezoneJS.Date(parseInt(year, 10),
                                       parseInt(month, 10) - 1,
                                       parseInt(day, 10),
                                       parseInt(hour, 10),
                                       parseInt(minute, 10),
                                       parseInt(second, 10),
                                       'America/Chicago');
  return d;
}

function delta(d1, d2) {
  d1 = d1.getTime();
  d2 = d2.getTime();

  return Math.floor((d1 - d2) / 1000 / 60);
}
