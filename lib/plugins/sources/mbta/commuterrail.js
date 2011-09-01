var async = require('async');
var winston = require('winston');

var rlrequest = require('../rlrequest');
var timezone = require('../../../ext/timezone');
var strftime = require('../../../ext/strftime');

module.exports = updateTrains;

function updateTrains(db) {
  var lines = [
    {
      'Line': 'Greenbush Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_1.json'
    },
    {
      'Line': 'Kingston/Plymouth Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_2.json'
    },
    {
      'Line': 'Middleborough/Lakeville Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_3.json'
    },
    {
      'Line': 'Fairmount Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_4.json'
    },
    {
      'Line': 'Providence/Stoughton Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_5.json'
    },
    {
      'Line': 'Franklin Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_6.json'
    },
    {
      'Line': 'Needham Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_7.json'
    },
    {
      'Line': 'Framingham/Worcester Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_8.json'
    },
    {
      'Line': 'Fitchburg Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_9.json'
    },
    {
      'Line': 'Lowell Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_10.json'
    },
    {
      'Line': 'Haverhill Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_11.json'
    },
    {
      'Line': 'Newburyport/Rockport Line',
      'Feed': 'http://developer.mbta.com/lib/RTCR/RailLine_12.json'
    }
  ];
  async.forEachSeries(lines,
      function(lineData, callback) {
        fetchTrainFeed(lineData, db, callback);
      },
      function(err) {
        if (err) {
          winston.error('Error fetching MBTA commuter rail trains', err);
        }
      });

}

function fetchTrainFeed(lineData, db, callback) {
  async.waterfall([
    function(callback) {
      rlrequest.request_limited({uri: lineData.Feed},
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
    function(parsed, callback) {
      var trains = parsed.Messages;

      async.map(trains, function(item, callback) {
        var trainOut = {};

        for (var i = 0; i < item.length; i++) {
          var pair = item[i];
          if (pair.Value != '') {
            trainOut[pair.Key] = pair.Value;
          }
        }

        trainOut.Line = lineData.Line;

        var timestamp = parseInt(trainOut.Scheduled, 10);
        var lateness = parseInt(trainOut.Lateness || '0', 10);

        var ts = new timezone.timezoneJS.Date();
        ts.setTimezone('US/Eastern');
        ts.setTime((timestamp + lateness) * 1000);
        ts = new Date(ts);

        trainOut.Time = ts.getTime();
        trainOut.TimeString = strftime.strftime('%I:%M %p', ts);
        callback(null, trainOut);
      }, callback);
    },
    function(trainsOut, callback) {
      var collection = db.collection('mbta_cr_trains');

      async.series(
          [
           function(callback) {
             collection.remove({'Line': lineData.Line},
                               {'safe': true}, callback);
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
