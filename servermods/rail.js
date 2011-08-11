exports.configure = configure;

function configure(db, socket) {
    socket.on('set trains', function(rtu, callback) {
        var collection = db.collection('stations');
        collection.findOne({"Code": rtu},
                             function(err, station) {
                                 if (!err) {
                                     var rtus = [rtu];
                                     
                                     if (station.StationTogether1 !== '') {
                                         rtus.push(station.StationTogether1);
                                     }
                                     
                                     if (station.StationTogether2 !== '') {
                                         rtus.push(station.StationTogether2);
                                     }

                                     socket.set('rtus', rtus);
                                     callback({'name': station.Name});

                                 } else {
                                     console.log("ERR: "+err);
                                 }
                             });
    });


    socket.on('get trains', function (minutes, callback) {
        socket.get('rtus', function(err, rtus) {
            var collection = db.collection('trains');
            collection.findItems({"LocationCode": {"$in": rtus}, "Min": {"$gte": minutes}},
                                 {"Car":1, "DestinationName":1, "Line":1, "Min":1, "_id":0},
                                 {"sort": {"Min":1}}, 
                                 function(err, items) {
                                     if (!err) {
                                         callback({trains: items});
                                     } else {
                                         console.log("ERR: "+err);
                                     }
                                 }); 
        });
    });
    
    socket.on('get incidents', function(callback) {
        var collection = db.collection('incidents');
        collection.findItems({},
                             {'Description': 1, 'LinesAffectedArr': 1, "_id": 0},
                             function(err, items) {
                                 if (!err) {
                                     callback({incidents: items});
                                 } else {
                                     console.log("ERR: "+err);
                                 }
                             });    
    });
}