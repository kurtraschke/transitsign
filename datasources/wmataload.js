var request = require('request');
var mongo = require('mongoskin');
var async = require('async');

var db = mongo.db('localhost:27017/testdb');

var wmata_api_key = "";

function updateStations() {
    request({uri:'http://api.wmata.com/Rail.svc/json/JStations?api_key='+wmata_api_key},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    var stations = parsed.Stations;
                    var collection = db.collection('stations');
                    
                    async.series([
                        function(callback) {
                            collection.remove({},{"safe":true}, callback);
                        },
                        function(callback) {
                            collection.insert(stations, {"safe":true}, callback);
                        }],
                                 function(err, results) {
                                     if (err) {
                                         console.log(err);
                                     }
                                 });
                }
            });
}

function updateStops() {
    request({uri:'http://api.wmata.com/Bus.svc/json/JStops?api_key='+wmata_api_key},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    var stops = parsed.Stops;
                    var collection = db.collection('bus_stops');
                    
                    async.series([
                        function(callback) {
                            collection.remove({},{"safe":true}, callback);
                        },
                        function(callback) {
                            collection.insert(stops, {"safe":true}, callback);
                        }],
                                 function(err, results) {
                                     if (err) {
                                         console.log(err);
                                     }
                                 });
                }
            });
}