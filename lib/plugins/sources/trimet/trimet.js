var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateTriMetPredictions;

function updateTriMetPredictions(agency, stopIDs, db, callback) {
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: URLForStops(
          keymaster.keyForAgency('TriMet'), stopIDs)
      },
      function(error, response, body) {
        callback(error, body);
      });
    },
    function(body, callback) {
      var parser = new xml2js.Parser();
      parser.on('end', function(result) {
        callback(null, result);
      });
      parser.on('error', function(err) {
        callback(err);
      });
      parser.parseString(body);
    },
    function(data, callback) {
      var tripsOut = Array();

      var queryTime = parseInt(data['@']['queryTime']);

      var locationsIn = data['location'];

      if (!(locationsIn instanceof Array)) {
        locationsIn = [locationsIn];
      }

      locations = {};

      for (var i = 0; i < locationsIn.length; i++) {
        var location = locationsIn[i];

        locations[location['@']['locid']] = {
          directionText: location['@']['dir'],
          stopName: location['@']['desc']
        };
      }

      var arrivals = data['arrival'];

      if (!(arrivals instanceof Array)) {
        arrivals = [arrivals];
      }

      for (var i = 0; i < arrivals.length; i++) {
        var arrival = arrivals[i];

        var status = arrival['@']['status'];
        var scheduledTime = Math.floor((parseInt(arrival['@']['scheduled']) -
                                        queryTime) / 60 / 1000);
        var time;

        if (status === 'scheduled' && scheduledTime <= 60) {
          //The TriMet API will return trips scheduled for the next day, etc.
          //To keep from showing outrageous times, we only show scheduled
          //trips for the next hour, and all trips for which there is an
          //actual ETA (the 'estimated' time)
          time = scheduledTime;
        } else if (status === 'estimated') {
          time = Math.floor((parseInt(arrival['@']['estimated']) -
                             queryTime) / 60 / 1000);
        } else {
          //service is cancelled or delayed; don't bother trying to show it
          continue;
        }

        var stopID = arrival['@']['locid'];

        var trip = {'Agency': agency,
          'DirectionText': locations[stopID].directionText,
          'StopName': locations[stopID].stopName,
          'Minutes': time,
          'RouteID': arrival['@']['shortSign'],
          'StopID': stopID};

        tripsOut.push(trip);
      }
      callback(null, tripsOut);
    },
    function(tripsOut, callback) {
      var collection = db.collection('bus_predictions');

      async.series(
          [
           function(callback) {
             collection.remove({'StopID': {'$in': stopIDs},
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

function URLForStops(key, stopIDs) {
  return 'http://developer.trimet.org/ws/V1/arrivals?appID=' +
             key + '&locIDs=' + stopIDs.join(',');
}
