var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateTrains;

function updateTrains(db, callback) {
  var url = 'http://api.wmata.com/StationPrediction.svc/json/' +
      'GetPrediction/all?api_key=' + keymaster.keyForAgency('WMATA');
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed_data, callback) {
      var trains = parsed_data.Trains;
      var trainsOut = Array();

      if (typeof trains !== 'undefined') {
        for (var i = 0; i < trains.length; i++) {
          var train = trains[i];
          if (train.Min === '' || train.DestinationName === '' ||
              train.Car === '' || train.Line === '') {
            continue;
          }

          if (train.Min === 'ARR') {
            train.Min = -1;
          } else if (train.Min === 'BRD') {
            train.Min = -2;
          } else {
            train.Min = parseInt(train.Min);
          }
          trainsOut.push(train);
        }
      }

      callback(null, trainsOut);
    },
    function(trainsOut, callback) {
      var collection = db.collection('metrorail_trains');

      async.series(
          [
           function(callback) {
             collection.remove({},{'safe': true}, callback);
           },
           function(callback) {
             if (trainsOut.length > 0) {
               collection.insert(trainsOut, {'safe': true}, callback);
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
