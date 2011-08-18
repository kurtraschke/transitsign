var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('../rlrequest');

module.exports = updateTrains;

function updateTrains(db, callback) {
  async.waterfall([
    function(callback) {
      var url = 'http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&key=MW9S-E7SL-26DU-VV8V';
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            callback(error, body);
          }
      );
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
    function(parsed_data, callback) {
      var stations = parsed_data.station;
      var trainsOut = Array();

      if (typeof stations !== 'undefined') {
        for (var i = 0; i < stations.length; i++) {
          var station = stations[i];
          for (var j = 0; j < station.etd.length; j++) {
            var etd = station.etd[j];

            if (!(etd.estimate instanceof Array)) {
              etd.estimate = [etd.estimate];
            }

            for (var k = 0; k < etd.estimate.length; k++) {
              var estimate = etd.estimate[k];

              if (estimate.minutes === 'Arrived') {
                estimate.minutes = -1;
              } else {
                estimate.minutes = parseInt(estimate.minutes);
              }

              estimate.stationName = station.name;
              estimate.stationAbbr = station.abbr;
              estimate.destinationName = etd.destination;
              estimate.destinationAbbr = etd.abbreviation;
            
              trainsOut.push(estimate);
              }
            }
        }
      }
      callback(null, trainsOut);
    },
    function(trainsOut, callback) {
      var collection = db.collection('bart_trains');

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
