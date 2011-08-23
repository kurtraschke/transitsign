var async = require('async');
var winston = require('winston');

var rlrequest = require('../rlrequest');

module.exports = updateTrains;

function updateTrains(db) {
  var lines = ['Red', 'Orange', 'Blue'];
  async.forEachSeries(lines,
      function(line, callback) {
        fetchTrainFeed(line, db, callback);
      },
      function(err) {
        if (err) {
          winston.error('Error fetching MBTA trains', err);
        }
      });

}

function fetchTrainFeed(line, db, callback) {
  async.waterfall([
    function(callback) {
      url = feedForLine(line);
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
    function(parsed, callback) {
      var trains = parsed;
      var trainsOut = Array();

      for (var i = 0; i < trains.length; i++) {
        var train = trains[i];

        if (train.InformationType == 'Arrived' || train.Revenue != 'Revenue') {
          continue;
        }

        train.Direction = train.PlatformKey.charAt(train.PlatformKey.length - 1);

        var blueWestTerminus;
        var d = new Date();

        if (d.getDay() > 0 && d.getDay() < 6 &&
            d.getHours() > 5 && d.getMinutes() > 15 &&
            d.getHours() <= 18 && d.getHours() <= 30) {
          blueWestTerminus = 'Bowdoin';
        } else {
          blueWestTerminus = 'Government Center';
        }

        var destinations = {
          'Red': {'N': {'0': 'Alewife' , '1': 'Alewife' },
            'S': {'0': 'Braintree' , '1': 'Ashmont' }},
          'Blue': {'E': {'0': 'Wonderland' , '1': 'Wonderland' },
            'W': {'0': blueWestTerminus, '1': blueWestTerminus }},
          'Orange': {'N': {'0': 'Oak Grove' , '1': 'Oak Grove' },
            'S': {'0': 'Forest Hills' , '1': 'Forest Hills' }}
        };

        train.Destination = destinations[train.Line][train.Direction][train.Route];

        train.Minutes = parseTime(train.TimeRemaining);
        trainsOut.push(train);
      }

      callback(null, trainsOut);
    },
    function(trainsOut, callback) {
      var collection = db.collection('mbta_trains');

      async.series(
          [
           function(callback) {
             collection.remove({'Line': line},{'safe': true}, callback);
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

function feedForLine(line) {
  var baseURL = 'http://developer.mbta.com/Data/';
  var feeds = {'Red': 'Red.json',
    'Orange': 'orange.json',
    'Blue': 'blue.json'};

  return baseURL + feeds[line];
}

function parseTime(timeString) {
  var parts = timeString.split(':');

  var hours = parseInt(parts[0]);
  var minutes = parseInt(parts[1]);
  var seconds = parseInt(parts[2]);

  minutes += hours * 60;
  minutes += seconds / 60;

  return Math.round(minutes);
}
