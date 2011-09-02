var async = require('async');

var fetch = require('../fetch');

module.exports = updateConnexionzPredictions;

function updateConnexionzPredictions(baseURL, agency, stop_id, db, callback) {
  var path = '/rtt/public/utility/file.aspx' +
             '?contenttype=SQLXML&Name=RoutePositionET.xml&PlatformNo=';
  var url = baseURL + path + stop_id;
  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(data, callback) {
      var tripsOut = Array();

      var StopName = data.Platform['@'].Name;

      if ('Route' in data.Platform) {
        var routes = data.Platform.Route;
        if (!(routes instanceof Array)) {
          routes = [routes];
        }

        for (var i = 0; i < routes.length; i++) {
          var route = routes[i];
          var RouteID = route['@'].RouteNo;

          var destinations = route.Destination;

          if (!(destinations instanceof Array)) {
            destinations = [destinations];
          }

          for (var j = 0; j < destinations.length; j++) {
            var destination = destinations[j];
            var destinationName = destination['@'].Name;

            var trips = destination.Trip;
            if (!(trips instanceof Array)) {
              trips = [trips];
            }

            for (var k = 0; k < trips.length; k++) {
              var trip = trips[k]['@'];
              tripsOut.push({'Minutes': parseInt(trip.ETA),
                'StopName': StopName,
                'StopID': stop_id,
                'RouteID': RouteID,
                'DestinationName': destinationName,
                'Agency': agency});
            }
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
