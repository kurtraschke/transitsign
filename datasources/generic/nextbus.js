var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('../rlrequest');

exports.updateNextBusPredictions = updateNextBusPredictions;

function url_for_stop(agency_id, stop_id) {
  return 'http://webservices.nextbus.com/service/publicXMLFeed?' +
         'command=predictions&a=' + agency_id + '&stopId=' + stop_id;
}

function updateNextBusPredictions(db, agency, agency_id, stop_id, callback) {
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: url_for_stop(agency_id, stop_id)},
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
      routes = data.predictions;

      if (!(routes instanceof Array)) {
        routes = [routes];
      }

      for (var i = 0; i < routes.length; i++) {
        var route = routes[i];

        var RouteID = route['@'].routeTitle;
        var StopName = route['@'].stopTitle;

        if (!('direction' in route)) {
          continue;
        }

        var directions = route.direction;

        if (!(directions instanceof Array)) {
          directions = [directions];
        }

        for (var j = 0; j < directions.length; j++) {
          var direction = directions[j];
          var DirectionName = direction['@'].title;

          var trips = direction.prediction;
          if (!(trips instanceof Array)) {
            trips = [trips];
          }

          for (var k = 0; k < trips.length; k++) {
            var trip = trips[k]['@'];
            tripsOut.push({'Minutes': parseInt(trip.minutes),
              'StopName': StopName,
              'StopID': stop_id,
              'RouteID': RouteID,
              'DirectionText': DirectionName,
              'Agency': agency});
          }
        }
      }

      callback(null, tripsOut);
    },
    function(tripsOut, callback) {
      var collection = db.collection('bus_predictions');

      async.series(
          [
           function(callback) {
             collection.remove({'StopID': stop_id,
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
