var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('../rlrequest');
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
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: baseURL + path},
          function(error, response, body) {
            if (!error && response.statusCode == 200) {
              callback(null, body);
            } else {
              callback({'error': error, 'response': response});
            }
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

      var predictions = data.prd;
      if (!(predictions instanceof Array)) {
        predictions = [predictions];
      }

      for (var i = 0; i < predictions.length; i++) {
        var prediction = predictions[i];

        var tmstmp = parseTime(prediction.tmstmp);
        var prdtm = parseTime(prediction.prdtm);

        tripsOut.push({'Minutes': Math.round((prdtm - tmstmp) / 1000 / 60),
          'StopName': prediction.stpnm,
          'StopID': prediction.stpid,
          'RouteID': prediction.rt,
          'DirectionText': prediction.rtdir + ' to ' + prediction.des,
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
