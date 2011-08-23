var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateTrains;

function updateTrains(db, callback) {
  async.waterfall([
    function(callback) {
      var url = 'http://api.wmata.com/StationPrediction.svc/json/' +
                'GetPrediction/all?api_key=' + keymaster.keyForAgency('WMATA');
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            if (!error && response.statusCode == 200) {
              var parsed = JSON.parse(body);
              callback(null, parsed);
            } else {
              callback({'error': error, 'response': response});
            }
          }
      );
    },
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
