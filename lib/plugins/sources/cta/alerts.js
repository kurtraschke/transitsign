var async = require('async');
var winston = require('winston');

var fetch = require('../fetch');

module.exports = updateIncidents;

function updateIncidents(db) {
  var url = 'http://www.transitchicago.com/api/1.0/alerts.aspx' +
                '?activeonly=true';
  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(parsed_data, callback) {
      if (parsed_data.ErrorCode !== '0') {
        if (parsed_data.ErrorCode == '25' || parsed_data.ErrorCode == '50') {
          callback(null, []);
        } else {
          callback({'error': parsed_data.ErrorMessage});
        }
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
