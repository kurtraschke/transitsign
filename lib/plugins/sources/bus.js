var async = require('async');
var winston = require('winston');

module.exports = updateBuses;

function updateBuses(agencies, db, callback) {
  var collection = db.collection('stop_subscriptions');

  collection.group(['Agency'],
      {'subscriberCount': {'$gte': 1}},
      {stops: Array()},
      'function(obj, prev) {prev.stops.push(obj.StopID);}',
      true,
      function(err, results) {
        if (!err) {
          async.forEachSeries(results, function(item, callback) {
            var agencyName = item.Agency;
            if (!(agencyName in agencies)) {
              callback({'error': 'agency ' + agencyName + ' not found.'});
              return;
            }
                                
            var agency = agencies[agencyName];
            var updateFunction = require('./' + agency.source);
            var updateParameters = agency.parameters;
            var batchSize = agency.batchSize || 1;

            var batchedStops = grouper(item.stops, batchSize);

            async.forEachSeries(batchedStops, function(item, callback) {
              var stopID;
              if (batchSize == 1) {
                stopID = item[0];
              } else {
                stopID = item;
              }
              winston.info('Updating ' + agencyName + ' ' + stopID);
              var params = updateParameters.concat([stopID, db, callback]);
              updateFunction.apply(null, params);

            }, callback);
          }, callback);
        } else {
          callback(err);
        }
      });
}

function grouper(arrayIn, groupSize) {
  if (arrayIn.length <= groupSize) {
    return [arrayIn];
  } else {
    var out = [];
    while (arrayIn.length > 0) {
      out.push(arrayIn.splice(0, groupSize));
    }
    return out;
  }
}
