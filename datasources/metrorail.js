var async = require('async');

var rlrequest = require('./rlrequest');
var wmata_api_key = require('../wmatakey').api_key;

exports.updateTrains = updateTrains;
exports.updateIncidents = updateIncidents;

function updateTrains(db) {
    rlrequest.request_limited({uri:'http://api.wmata.com/StationPrediction.svc/json/GetPrediction/all?api_key='+wmata_api_key},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    
                    var trains = parsed.Trains;
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
                    
                    var collection = db.collection('trains');
                    
                    async.series([
                        function(callback) {
                            collection.remove({},{"safe":true}, callback);
                        },
                        function(callback) {
                            collection.insert(trainsOut, {"safe":true}, callback);
                        }],
                                 function(err, results) {
                                     if (err) {
                                         console.log(err);
                                     }
                                 });
                    
                }
            });
}


function updateIncidents(db) {
    rlrequest.request_limited({uri:'http://api.wmata.com/Incidents.svc/json/Incidents?api_key='+wmata_api_key},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var parsed = JSON.parse(body);
                    
                    var incidents = parsed.Incidents;
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
                    
                    var collection = db.collection('incidents');
                    
                    async.series([
                        function(callback) {
                            collection.remove({},{"safe":true}, callback);
                        },
                        function(callback) {
                            collection.insert(incidentsOut, {"safe":true}, callback);
                        }],
                                 function(err, results) {
                                     if (err) {
                                         console.log(err);
                                     }
                                 });
                    
                }
            });
}

function trim(string) {
    return string.replace(/^\s*|\s*$/, '')
}