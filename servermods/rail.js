exports.configure = configure;

function configure(db, socket) {
    socket.on('get trains', function (rtus, minutes, callback) {
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