exports.configure = configure;

function configure(db, socket) {
    socket.on('get cabi', function(station_ids, callback) {
        var collection = db.collection('cabi');
        collection.findItems({"id": {"$in": station_ids}},
                             {"id": 1, "locked": 1, "nbBikes": 1, "nbEmptyDocks": 1, "stationSize": 1, "name": 1, "_id": 0},
                             function(err, items) {
                                 if (!err) {
                                     callback({cabi: items});
                                 } else {
                                     console.log("ERR: "+err);
                                 }
                             });
    });
}