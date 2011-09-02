var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = updateIncidents;

function updateIncidents(db, callback) {
  var url = 'http://api.wmata.com/StationPrediction.svc/json/' +
      'GetPrediction/all?api_key=' + keymaster.keyForAgency('WMATA');
  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed_data, callback) {
      var incidents = parsed_data.Incidents || [];
      var incidentsOut = Array();

      for (var i = 0, l = incidents.length; i < l; i++) {
        var incident = incidents[i];

        incident.LinesAffectedArr = Array();

        var linesTemp = incident.LinesAffected.split(';');

        for (var j = 0; j < linesTemp.length; j++) {
          var line = linesTemp[j];
          line = trim(line);

          if (line.length > 0) {
            incident.LinesAffectedArr.push(line);
          }
        }

        incidentsOut.push(incident);
      }
      callback(null, incidentsOut);
    },
    function(incidentsOut, callback) {
      var collection = db.collection('metrorail_incidents');

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

function trim(string) {
  return string.replace(/^\s*|\s*$/, '');
}
