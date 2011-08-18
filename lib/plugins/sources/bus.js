var async = require('async');
var winston = require('winston');

module.exports = updateBuses;

function updateBuses(agencies, db, callback) {
  var collection = db.collection('stop_subscriptions');
  collection.findItems({'subscriberCount': {'$gte': 1}},
      {'Agency': 1, 'StopID': 1, '_id': 0},
      function(err, items) {
        if (!err) {
          async.forEachSeries(items,
              function(item, callback) {
                var agency = agencies[item.Agency];
                winston.info('Updating ' + item.Agency + ' ' + item.StopID);
                var updateFunction = require('./' + agency['source']);
                var updateParameters = agency['parameters'];
                var params = updateParameters.concat([item.StopID,
                                                      db, callback]);
                updateFunction.apply(null, params);
              }, callback);
        } else {
          callback(err);
        }
      });
}
