var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateMetrobusPredictions;

function updateMetrobusPredictions(agency, stop_id, db, callback) {
  var collection = db.collection('bus_predictions');
  var url = 'http://api.wmata.com/NextBusService.svc/json/JPredictions' +
      '?StopID=' + stop_id + '&api_key=' + keymaster.keyForAgency('WMATA');
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
      var busPredictions = parsed.Predictions;
      var predOut = Array();

      for (var i = 0, l = busPredictions.length; i < l; i++) {
        var prediction = busPredictions[i];
        prediction.StopID = stop_id;
        prediction.StopName = parsed.StopName;
        prediction.Minutes = parseInt(prediction.Minutes);
        prediction.Agency = agency;
        predOut.push(prediction);
      }
      callback(null, predOut);
    },
    function(predictions, callback) {
      async.series(
          [
           function(callback) {
             collection.remove({'StopID': stop_id,
               'Agency': agency}, {'safe': true}, callback);
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
