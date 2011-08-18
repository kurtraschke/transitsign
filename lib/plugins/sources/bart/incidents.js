var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('../rlrequest');

module.exports = updateIncidents;

function updateIncidents(db, callback) {
  async.waterfall([
    function(callback) {
      var url = 'http://api.bart.gov/api/bsa.aspx?cmd=bsa&key=MW9S-E7SL-26DU-VV8V';
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
      var incidents = parsed_data.bsa;

      if (!(incidents instanceof Array)) {
        incidents = [incidents];
      }

      callback(null, incidents);
    },
    function(incidentsOut, callback) {
      var collection = db.collection('bart_incidents');

      async.series(
          [
           function(callback) {
             collection.remove({},{'safe': true}, callback);
           },
           function(callback) {
             if (incidentsOut.length > 0) {
               collection.insert(incidentsOut, {'safe': true}, callback);
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