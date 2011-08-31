var async = require('async');
var winston = require('winston');
var xml2js = require('xml2js');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateIncidents;

function updateIncidents(db) {
  async.waterfall([
    function(callback) {
      var url = 'http://www.transitchicago.com/api/1.0/alerts.aspx' +
                '?activeonly=true';
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            if (!error && response.statusCode == 200) {
              callback(null, body);
            } else {
              callback({'error': error, 'response': response});
            }
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
      if (parsed_data.ErrorCode !== '0') {
        callback({'error': parsed_data.ErrorMessage});
        return;
      }

      if (!(parsed_data.Alert instanceof Array)) {
        parsed_data.Alert = [parsed_data.Alert];
      }

      async.map(parsed_data.Alert, function(item, callback) {
        if (!(item.ImpactedService.Service instanceof Array)) {
          item.ImpactedService.Service = [item.ImpactedService.Service];
        }
        item.SeverityScore = parseInt(item.SeverityScore, 10);
        callback(null, item);
      }, callback);
    },
    function(incidentsOut, callback) {
      var collection = db.collection('cta_incidents');

      async.series(
          [
           function(callback) {
             collection.remove({}, {'safe': true}, callback);
           },
           function(callback) {
             if (incidentsOut.length > 0) {
               collection.insert(incidentsOut, {'safe': true}, callback);
             } else {
               callback(null);
             }
           }
          ],
          function(error, results) {
            callback(error);
          });
    }
  ], function(error) {
    if (error) {
      winston.error('Error updating CTA incidents', error);
    }
  });
}
