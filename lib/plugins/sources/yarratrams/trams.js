var async = require('async');

var rlrequest = require('../rlrequest');

module.exports = updateYarraTramsPredictions;

function updateYarraTramsPredictions(agency, stopID, db, callback) {
  async.waterfall([
    function(callback) {
      async.parallel(
          {'predictions': function(callback) {
            rlrequest.request_limited({uri: URLForStopPredictions(stopID)
            },
            function(error, response, body) {
              callback(error, body);
            });
          },
          'stopName': function(callback) {
            getStopNameCached(stopID, db, callback);
          }
          }, callback);
    },
    function(data, callback) {
      var tripsOut = Array();

      var parsed = JSON.parse(data.predictions);
      var trips = parsed.responseObject;

      for (var i = 0; i < trips.length; i++) {
        var trip = trips[i];

        var tripOut = {
          'Agency': agency,
          'DestinationName': trip.Destination,
          'StopName': data.stopName,
          'Minutes': Math.round((parseTime(trip.PredictedArrivalDateTime) -
              parseTime(trip.RequestDateTime)) / 1000 / 60),
          'RouteID': trip.HeadboardRouteNo,
          'StopID': stopID,
          'VehicleID': trip.VehicleNo
        };

        tripsOut.push(tripOut);
      }
      callback(null, tripsOut);
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

function parseTime(timeString) {
  return parseInt(timeString.substring(6, 19));
}

function URLForStopPredictions(stopID) {
  return 'http://extranetdev.yarratrams.com.au/pidsservicejson/Controller/' +
         'GetNextPredictedRoutesCollection.aspx?r=0&s=' + stopID;
}

function URLForStopInformation(stopID) {
  return 'http://extranetdev.yarratrams.com.au/pidsservicejson/Controller/' +
         'GetStopInformation.aspx?s=' + stopID;
}

function getStopNameCached(stopID, db, callback) {
  var collection = db.collection('yarratrams_stops');

  collection.findOne({'StopID': stopID},
                     function(err, stopInformation) {
        if (err) {
          callback(err, null);
        } else if (stopInformation) {
          callback(null, stopInformation.StopName);
        } else {
          fetchStopInformation(stopID, db, callback);
        }
      });
}

function fetchStopInformation(stopID, db, callback) {
  var url = URLForStopInformation(stopID);

  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: URLForStopInformation(stopID)},
          function(error, response, body) {
            callback(error, body);
          });
    },
    function(body, callback) {
      var parsed = JSON.parse(body);
      if (parsed.isError) {
        callback({'error': 'Problem getting stop information for stop ID ' +
                         stopID});
      } else {
        var stopInformation = parsed.responseObject[0];
        stopInformation.StopID = stopID;
        var collection = db.collection('yarratrams_stops');
        collection.insert(stopInformation, {'safe': true},
                          function(err) {
                            if (err) {
                callback(err);
                            } else {
                callback(null, stopInformation.StopName);
                            }
                          });
      }
    }], callback);
}
