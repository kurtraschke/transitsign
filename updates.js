var async = require('async');

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
    var collection = db.collection("wx_subscriptions");
    collection.findItems({"subscriberCount": {"$gte": 1}},
                         {"station_id": 1, "_id":0},
                         function(err, items) {
                             if (!err) {
                                 async.forEachSeries(items,
                                                     function(item, callback) {
                                                         var station_id = item.station_id;
                                                         console.log("Updating weather for station ID "+station_id);
                                                         require('./datasources/wx').updateWX(db, station_id);
                                                         callback();
                                                     },
                                                     function(err){
                                                         if (err) {
                                                             console.log("error: " + err);
                                                         }
                                                     });
                             }
                         });
}

var agencyMap = {"Metrobus": require('./datasources/metrobus').updateMetrobusPredictions,
                 "ART": require('./datasources/art').updateARTPredictions,
                 "DC Circulator": require('./datasources/circulator').updateCirculatorPredictions};

function updateBuses(db) {
    var collection = db.collection("stop_subscriptions");
    collection.findItems({"subscriberCount": {"$gte": 1}},
                         {"Agency": 1, "StopID": 1, "_id":0},
                         function(err, items) {
                             if (!err) {
                                 async.forEachSeries(items,
                                                     function(item, callback) {
                                                         console.log("Updating "+item.Agency+" "+item.StopID)
                                                         var updateFunction = agencyMap[item.Agency];
                                                         updateFunction(db, item.StopID);
                                                         callback();
                                                     },
                                                     function(err){
                                                         if (err) {
                                                             console.log("error: "+err);
                                                         }
                                                     });
                             }
                         });
}

function updateCabi(db) {
    console.log("Updating Capital Bikeshare");
    require('./datasources/cabi').updateCabi(db);
}

function updateTrains(db) {
    console.log("Updating Metrorail predictions");
    require('./datasources/metrorail').updateTrains(db);
}

function updateIncidents(db) {
    console.log("Updating Metrorail incidents");
    require('./datasources/metrorail').updateIncidents(db);
}

function startUpdates(db, updateFunction, interval) {
    var fun = function(){updateFunction(db);};
    fun()
    return setInterval(fun, interval);
}

function periodicUpdates(db) {
    var railPredUpdates = startUpdates(db, updateTrains, 20*SECOND);
    var railIncidentUpdates = startUpdates(db, updateIncidents, 1*MINUTE*SECOND);
    var busPredUpdates = startUpdates(db, updateBuses, 1*MINUTE*SECOND);
    var cabiUpdates = startUpdates(db, updateCabi, 2*MINUTE*SECOND);
    var weatherUpdates = startUpdates(db, updateWeather, 30*MINUTE*SECOND);
}