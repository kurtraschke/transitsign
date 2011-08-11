exports.configure = configure;

function configure(db, socket) {
    socket.on('set buses', function(buses, callback) {
        incrementStopCounts(db, buses, 1);
        socket.set('buses', buses);
    });
    
    socket.on('get buses', function (callback) {
        socket.get('buses', function(err, stops) {
            var minutes = 1; //TODO: make this a config parameter in the client.
            var collection = db.collection('bus_predictions');
            collection.findItems({"$or": stops, "Minutes": {"$gte": minutes}},
                                 {"Agency":1, "RouteID":1, "StopName":1, "DirectionText":1, "StopID":1, "Minutes":1, "_id":0},
                                 {"sort": {"Minutes":1}}, 
                                 function(err, items) {
                                     if (!err) {
                                         callback({buses: items});
                                     } else {
                                         console.log("ERR: "+err);
                                     }
                                 });   
        });
    });

    socket.on('disconnect', function () {
        socket.get('buses', function (err, buses) {
            incrementStopCounts(db, buses, -1);
        });
    });
}


function incrementStopCounts(db, stops, incvalue) {
    var collection = db.collection('stop_subscriptions');
    if (stops instanceof Array) {
        for(var i = 0; i < stops.length; i++) {
            collection.update(stops[i], {"$inc": {subscriberCount: incvalue}}, {'upsert': true});
        }
    }
}