var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateCleverPredictions;

function updateCleverPredictions(baseURL, agency, keyname,
                                 stopIDs, db, callback) {

  if (stopIDs.length > 10) {
    callback({'error': 'Too many stop IDs.'});
  }
  var key = keymaster.keyForAgency(keyname);
  var path = '/bustime/api/v1/getpredictions' +
             '?key=' + key + '&stpid=' + stopIDs.join(',');
  var url = baseURL + path;
  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(data, callback) {
      var tripsOut = Array();

      if ('error' in data) {
        callback({'error': data.error});
        return;
      }
      
      var predictions = data.prd;
      if (!(predictions instanceof Array)) {
        predictions = [predictions];
      }

      for (var i = 0; i < predictions.length; i++) {
        var prediction = predictions[i];

        try {
          var tmstmp = parseTime(prediction.tmstmp);
          var prdtm = parseTime(prediction.prdtm); 
        } catch (error) {
          callback({'error': error});
          return;
        }

        tripsOut.push({'Minutes': Math.round((prdtm - tmstmp) / 1000 / 60),
          'StopName': prediction.stpnm,
          'StopID': prediction.stpid,
          'RouteID': prediction.rt,
          'DirectionText': prediction.rtdir,
          'DestinationName': prediction.des,
          'VehicleID': prediction.vid,
          'Agency': agency});
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

function parseTime(timeString) {
  var year = timeString.substring(0, 4);
  var month = timeString.substring(4, 6);
  var day = timeString.substring(6, 8);
  var hour = timeString.substring(9, 11);
  var minute = timeString.substring(12, 14);

  var date = new Date();

  date.setFullYear(parseInt(year, 10));
  date.setMonth(parseInt(month, 10) - 1);
  date.setDate(parseInt(day, 10));
  date.setHours(parseInt(hour, 10));
  date.setMinutes(parseInt(minute, 10));

  return date.getTime();
}
