var async = require('async');
var winston = require('winston');

var subscriptions = require('../../subscriptions');


module.exports = updateBuses;

function updateBuses(agencies, db, callback) {
  subscriptions.getActiveSubscriptions('Bus', db, function(subscriptions) {
    var subsByAgency = {};

    for (var i = 0; i < subscriptions.length; i++) {
      var subscription = subscriptions[i];
      var agency = subscription.Agency;
      var stopID = subscription.StopID;

      if (!(agency in subsByAgency)) {
        subsByAgency[agency] = [];
      }
      subsByAgency[agency].push(stopID);
    }

    async.forEachSeries(Object.keys(subsByAgency), function(item, callback) {
      var agencyName = item;
      if (!(agencyName in agencies)) {
        callback({'error': 'agency ' + agencyName + ' not found.'});
        return;
      }

      var agency = agencies[agencyName];
      var updateFunction = require('./' + agency.source);
      var updateParameters = agency.parameters;
      var batchSize = agency.batchSize || 1;

      var batchedStops = grouper(subsByAgency[item], batchSize);

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
