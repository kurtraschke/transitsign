var async = require('async');

var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateIncidents;

function updateIncidents(db, callback) {
  async.waterfall([
    function(callback) {
      var url = 'http://api.wmata.com/Incidents.svc/json/Incidents?api_key=' +
          keymaster.keyForAgency('WMATA');
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
      var incidents = parsed_data.Incidents;
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
