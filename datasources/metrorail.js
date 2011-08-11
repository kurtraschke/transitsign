var async = require('async');

var rlrequest = require('./rlrequest');
var wmata_api_key = require('../wmatakey').api_key;

exports.updateTrains = updateTrains;
exports.updateIncidents = updateIncidents;

function updateTrains(db, callback) {
    async.waterfall([
        function(callback) {
            var url = 'http://api.wmata.com/StationPrediction.svc/json/GetPrediction/all?api_key='+wmata_api_key;
            rlrequest.request_limited({uri: url},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    callback(null, parsed);
                } else {
                    callback(error);
                }
            }
                                     );
        },
        function(parsed_data, callback) {
            var trains = parsed_data.Trains;
            var trainsOut = Array();
            
            for(var i = 0; i < trains.length; i++) {
                var train = trains[i];
                if (train.Min === '' || train.DestinationName === '' || train.Car === '' || train.Line === '') {
                    continue;
                }
                        
                if (train.Min === 'ARR') {
                    train.Min = -1;
                } else if (train.Min === 'BRD') {
                    train.Min = -2;
                } else {
                    train.Min = parseInt(train.Min);
                }
                trainsOut.push(train)
            }
            callback(null, trainsOut);    
        },       
        function(trainsOut, callback) {
            var collection = db.collection('trains');
            
            async.series(
                [
                    function(callback) {
                        collection.remove({},{"safe":true}, callback);
                    },
                    function(callback) {
                        if (trainsOut.length > 0) {
                            collection.insert(trainsOut, {"safe":true}, callback);
                        } else {
                            callback(null);
                        }
                    }
                ],
                function(err, results) {
                    callback(err);
                });
        }
    ], callback)
};

function updateIncidents(db, callback) {
    async.waterfall([
        function(callback) {
            var url = 'http://api.wmata.com/Incidents.svc/json/Incidents?api_key='+wmata_api_key;
            rlrequest.request_limited({uri: url},
                                      function (error, response, body) {
                                          if (!error && response.statusCode == 200) {
                                              var parsed = JSON.parse(body);                    
                                              callback(null, parsed);
                                          } else {
                                              callback(error);
                                          }
                                      }
                                     );
        },
        function(parsed_data, callback) {
            var incidents = parsed_data.Incidents;
            var incidentsOut = Array();
            
            for(var i = 0, l = incidents.length; i < l; i++) {
                var incident = incidents[i];
                
                incident.LinesAffectedArr = Array();
                
                var linesTemp = incident.LinesAffected.split(";");
                
                for(var j = 0; j < linesTemp.length; j++) {
                    var line = linesTemp[j];
                    line = trim(line);
                    
                    if (line.length > 0) {
                        incident.LinesAffectedArr.push(line);
                    }
                }
                
                incidentsOut.push(incident);
            }
            callback(null, incidentsOut);
        },
        function(incidentsOut, callback) {
                    var collection = db.collection('incidents');
                    
                    async.series(
                        [
                            function(callback) {
                                collection.remove({},{"safe":true}, callback);
                            },
                            function(callback) {
                                if (incidentsOut.length > 0) {
                                    collection.insert(incidentsOut, {"safe":true}, callback);
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

function trim(string) {
    return string.replace(/^\s*|\s*$/, '')
}