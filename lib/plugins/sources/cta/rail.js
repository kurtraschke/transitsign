var async = require('async');
var winston = require('winston');


var fetch = require('../fetch');
var keymaster = require('../../../keymaster');
var subscriptions = require('../../../subscriptions');

module.exports = updateTrains;

function updateTrains(db) {
  subscriptions.getActiveSubscriptions('CTA Rail', db, function(items) {
    async.forEachSeries(items,
        function(item, callback) {
          var mapid = item.mapid;
          winston.info('Updating CTA rail predictions for station ID ' + mapid);
          fetchTrains(mapid, db, callback);
        },
        function(err) {
          if (err) {
            winston.error('Error updating CTA rail predictions', err);
          }
        });
  });
}

function fetchTrains(mapid, db, callback) {
  var key = keymaster.keyForAgency('CTARail');
  var url = URLForStop(key, mapid);

  async.waterfall([
    fetch.fetch(url, 'xml'),
    function(parsed_data, callback) {
      if (parsed_data.errCd !== '0') {
        callback({'error': parsed_data.errNm});
        return;
      }

      var eta = parsed_data.eta;
      var trainsOut = Array();

      if (!(eta instanceof Array)) {
        eta = [eta];
      }

      for (var i = 0; i < eta.length; i++) {
        var train = eta[i];

        var prdt = parseTime(train.prdt);
        var arrT = parseTime(train.arrT);

        var min = Math.floor((arrT - prdt) / 1000 / 60);

        train.min = min;

        trainsOut.push(train);
      }
      callback(null, trainsOut);
    },
    function(trainsOut, callback) {
      var collection = db.collection('cta_trains');

      async.series(
          [
           function(callback) {
             collection.remove({'staId': mapid},{'safe': true}, callback);
           },
           function(callback) {
             if (trainsOut.length > 0) {
               collection.insert(trainsOut, {'safe': true}, callback);
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

function URLForStop(key, mapid) {
  return 'http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?mapid=' +
      mapid + '&key=' + key;
}

function parseTime(timeString) {
  var year = timeString.substring(0, 4);
  var month = timeString.substring(4, 6);
  var day = timeString.substring(6, 8);
  var hour = timeString.substring(9, 11);
  var minute = timeString.substring(12, 14);
  var second = timeString.substring(15);

  var date = new Date();

  date.setFullYear(parseInt(year, 10));
  date.setMonth(parseInt(month, 10) - 1);
  date.setDate(parseInt(day, 10));
  date.setHours(parseInt(hour, 10));
  date.setMinutes(parseInt(minute, 10));
  date.setSeconds(parseInt(second, 10));

  return date.getTime();
}
