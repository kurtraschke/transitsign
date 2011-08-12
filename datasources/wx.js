var xml2js = require('xml2js');
var async = require('async');

var rlrequest = require('./rlrequest');

exports.updateWX = updateWX;

function urlForStation(station_id) {
  return 'http://www.weather.gov/xml/current_obs/' + station_id + '.xml';
}

function updateWX(db, station_id, callback) {
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: urlForStation(station_id)},
          function(error, response, body) {
            callback(error, body);
          });
    },
    function(body, callback) {
      var parser = new xml2js.Parser();
      parser.on('end', function(result) {
        callback(null, result);
      });
      parser.parseString(body);
    },
    function(data, callback) {
      var collection = db.collection('wx_obs');

      async.series(
          [
           function(callback) {
             collection.remove({'station_id': station_id},
                               {'safe': true}, callback);
           },
           function(callback) {
             collection.insert(data, {'safe': true}, callback);
           }
          ],
          function(err, results) {
            callback(err);
          });
    }
  ], callback);
}
