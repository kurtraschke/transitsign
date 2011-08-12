var async = require('async');

var rlrequest = require('./rlrequest');
var wmata_api_key = require('../wmatakey').api_key;

exports.updateMetrobusPredictions = updateMetrobusPredictions;

function updateMetrobusPredictions(db, stop_id, callback) {
  var collection = db.collection('bus_predictions');

  async.waterfall([
    function(callback) {
      url = 'http://api.wmata.com/NextBusService.svc/json/JPredictions?StopID=' +
          stop_id + '&api_key=' + wmata_api_key;
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var parsed = JSON.parse(body);

              var busPredictions = parsed.Predictions;
              var predOut = Array();

              for (var i = 0, l = busPredictions.length; i < l; i++) {
                var prediction = busPredictions[i];
                prediction.StopID = stop_id;
                prediction.StopName = parsed.StopName;
                prediction.Minutes = parseInt(prediction.Minutes);
                prediction.Agency = 'Metrobus';
                predOut.push(prediction);
              }
              callback(null, predOut);
            } else {
              callback(error);
            }
          }
      );
    },
    function(predictions, callback) {
      async.series(
          [
           function(callback) {
             collection.remove({'StopID': stop_id,
               'Agency': 'Metrobus'}, {'safe': true}, callback);
           },
           function(callback) {
             if (predictions.length > 0) {
               collection.insert(predictions, {'safe': true}, callback);
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
