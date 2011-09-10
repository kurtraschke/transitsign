var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateIncidents;

function updateIncidents(db, callback) {
  var url = 'http://api.bart.gov/api/bsa.aspx?cmd=bsa&key=' +
      keymaster.keyForAgency('BART');
  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(parsed_data, callback) {
      var incidents = parsed_data.bsa || [];

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
