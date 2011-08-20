var async = require('async');
var winston = require('winston');
var xml2js = require('xml2js');


var rlrequest = require('../rlrequest');
var keymaster = require('../../../keymaster');

module.exports = updateTrains;

function updateTrains(db) {
  var collection = db.collection('cta_train_subscriptions');
  collection.findItems({'subscriberCount': {'$gte': 1}},
                       {'mapid': 1, '_id': 0},
                       function(err, items) {
                         if (!err) {
                           async.forEachSeries(items,
                           function(item, callback) {
                             var mapid = item.mapid;
                             winston.info(
                    'Updating CTA rail predictions for station ID ' +
                                          mapid);
                             fetchTrains(mapid, db, callback);
                           }, function(err) {
                             if (err) {
                               winston.error(
                      'Error updating CTA rail predictions',
                                   err);
                             }
                           });
                         } else {
          winston.error('Error getting CTA rail subscriptions', err);
                         }
                       });
}

function fetchTrains(mapid, db, callback) {
  var key = keymaster.keyForAgency('CTARail');
  async.waterfall([
    function(callback) {
      var url = URLForStop(key, mapid);
      rlrequest.request_limited({uri: url},
          function(error, response, body) {
            callback(error, body);
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
      if (parsed_data.errCd !== '0') {
        callback({'error': parsed_data.errNm});
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

  date.setFullYear(parseInt(year));
  date.setMonth(parseInt(month) - 1);
  date.setDate(parseInt(day));
  date.setHours(parseInt(hour));
  date.setMinutes(parseInt(minute));
  date.setSeconds(parseInt(second));

  return date.getTime();
}
