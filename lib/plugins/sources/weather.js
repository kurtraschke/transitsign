var async = require('async');
var winston = require('winston');

var fetch = require('./fetch');
var subscriptions = require('../../subscriptions');

module.exports = updateWeather;

function updateWeather(db) {
  subscriptions.getActiveSubscriptions('US Weather', db, function(items) {
    async.forEachSeries(items,
        function(item, callback) {
          var station_id = item.station_id;
          winston.info('Updating weather for station ID ' + station_id);
          fetchWeather(db, station_id, callback);
        },
        function(err) {
          if (err) {
            winston.error('Error updating weather', err);
          }
        });
  });
}

function fetchWeather(db, station_id, callback) {
  var url = urlForStation(station_id);
  async.waterfall([
    fetch.fetch(url, 'xml'),
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
