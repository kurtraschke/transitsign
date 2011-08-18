var async = require('async');
var winston = require('winston');
var xml2js = require('xml2js');

var rlrequest = require('./rlrequest');

module.exports = updateWeather;

function updateWeather(db) {
  var collection = db.collection('wx_subscriptions');
  collection.findItems({'subscriberCount': {'$gte': 1}},
                       {'station_id': 1, '_id': 0},
                       function(err, items) {
                         if (!err) {
                           async.forEachSeries(items,
                           function(item, callback) {
                             var station_id = item.station_id;
                             winston.info('Updating weather for station ID ' +
                                          station_id);
                             fetchWeather(db, station_id, callback);
                           },
                           function(err) {
                             if (err) {
                               winston.error('Error updating weather', err);
                             }
                           });
                         } else {
          winston.error('Error getting weather subscriptions', err);
                         }
                       });
}

function fetchWeather(db, station_id, callback) {
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
      parser.on('error', function(err) {
        callback(err);
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

function urlForStation(station_id) {
  return 'http://www.weather.gov/xml/current_obs/' + station_id + '.xml';
}
