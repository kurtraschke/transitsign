var async = require('async');
var winston = require('winston');

var SECOND = 1000;
var MINUTE = 60;

//Update rates:
//Metrorail: 20 seconds
//Metrorail incidents: 60 seconds
//Buses: 60 seconds
//Capital Bikeshare: 120 seconds
//Weather: 1800 seconds

exports.periodicUpdates = periodicUpdates;

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
                             require('./datasources/wx').updateWX(db,
                                                                  station_id,
                                                                  callback);
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

var agencyMap = {
  'Metrobus': {
    'fun': require('./datasources/metrobus'),
    'parameters': ['Metrobus']
  },
  'ART': {
    'fun': require('./datasources/generic/connexionz'),
    'parameters': ['http://realtime.commuterpage.com', 'ART']
  },
  'DC Circulator': {
    'fun': require('./datasources/generic/nextbus'),
    'parameters': ['dc-circulator', 'DC Circulator']
  }
};

function updateBuses(db) {
  var collection = db.collection('stop_subscriptions');
  collection.findItems({'subscriberCount': {'$gte': 1}},
      {'Agency': 1, 'StopID': 1, '_id': 0},
      function(err, items) {
        if (!err) {
          async.forEachSeries(items,
              function(item, callback) {
                winston.info('Updating ' + item.Agency + ' ' + item.StopID);
                var updateFunction = agencyMap[item.Agency]['fun'];
                var updateParameters = agencyMap[item.Agency]['parameters'];
                var params = updateParameters.concat([item.StopID,
                                                      db, callback]);
                updateFunction.apply(null, params);
              },
              function(err) {
                if (err) {
                  winston.error('Error updating bus predictions',
                      err);
                }
              });
        }
      });
}

var PBSCSystems = [
  {'name': 'Capital Bikeshare',
    'url': 'http://www.capitalbikeshare.com/stations/bikeStations.xml'}
  //{'name': 'BIXI', 'url': 'https://www.bixi.com/data/bikeStations.xml'}
];

function updatePBSC(db) {
  async.forEachSeries(PBSCSystems,
      function(item, callback) {
        winston.info('Updating PBSC bikeshare system ' + item.name);
        require('./datasources/generic/pbsc').updatePBSC(db, item.url,
                                                         item.name, callback);
      },function(err) {
        if (err) {
          winston.error('Error updating PBSC bikeshare system', err);
        }
      });
}

function updateBcycle(db) {
  winston.info('Updating B-cycle');
  require('./datasources/generic/bcycle').updateBcycle(db, function(err) {
    if (err) {
      winston.error('Error updating Bcycle', err);
    }
  });
}

function updateTrains(db) {
  winston.info('Updating Metrorail predictions');
  require('./datasources/metrorail').updateTrains(db, function(err) {
    if (err) {
      winston.error('Error updating Metrorail predictions', err);
    }
  });
}

function updateIncidents(db) {
  winston.info('Updating Metrorail incidents');
  require('./datasources/metrorail').updateIncidents(db, function(err) {
    if (err) {
      winston.error('Error updating Metrorail predictions', err);
    }
  });
}

function startUpdates(db, updateFunction, interval) {
  var fun = function() {updateFunction(db);};
  fun();
  return setInterval(fun, interval);
}

function periodicUpdates(db) {
  var railPredUpdates = startUpdates(db, updateTrains, 20 * SECOND);
  var railIncidentUpdates = startUpdates(db, updateIncidents,
                                         1 * MINUTE * SECOND);
  var busPredUpdates = startUpdates(db, updateBuses, 1 * MINUTE * SECOND);
  var pbscUpdates = startUpdates(db, updatePBSC, 2 * MINUTE * SECOND);
  //var bcycleUpdates = startUpdates(db, updateBcycle, 2 * MINUTE * SECOND);
  var weatherUpdates = startUpdates(db, updateWeather, 30 * MINUTE * SECOND);
}
