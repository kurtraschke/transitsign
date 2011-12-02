var async = require('async');

var fetch = require('../fetch');
var keymaster = require('../../../keymaster');

module.exports = fetchStopInformation;

function fetchStopInformation(stop_id, db, callback) {
  var key = keymaster.keyForAgency('CUMTD');
  var version = 'v2.0';
  var format = 'json';
  var url = 'http://developer.cumtd.com/api/' + version + '/' + format +
                '/getStop?key=' + key + '&stop_id=' + stop_id;

  async.waterfall([
    fetch.fetch(url, 'json'),
    function(parsed, callback) {
      if (parsed.status.msg != 'ok') {
        callback({'error': parsed.status});
      } else {
        var collection = db.collection('cumtd_stops');
        var stop = parsed.stops[0];

        var points = stop.points;
        points.push(
            {'stop_id': stop.stop_id,
              'stop_name': stop.stop_name,
              'code': stop.code}
        );

        async.series([
          function(callback) {
            collection.insert(points, {'safe': true}, callback);
          },
          function(callback) {
            collection.ensureIndex({'stop_id': 1}, callback);
          },
          function(callback) {
            collection.findOne({'stop_id': stop_id},
                               function(error, stopInformation) {
                  if (error) {
                    callback(error);
                  } else {
                    callback(null, stopInformation.stop_name);
                  }
                });
          }
        ], callback);
      }
    }
  ], callback);
}
