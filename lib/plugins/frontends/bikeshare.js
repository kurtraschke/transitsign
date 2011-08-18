var winston = require('winston');


exports.configure = configure;
exports.init = init;

function init(db, callback) {
  db.collection('bikeshare').ensureIndex({'system': 1, 'id': 1}, callback);
}

function configure(db, socket) {
  socket.on('get bikeshare', function(systemName, stationIDs, callback) {
    var collection = db.collection('bikeshare');
    collection.findItems({'system': systemName, 'id': {'$in': stationIDs}},
        {'id': 1, 'bikes': 1, 'docks': 1,
          'size': 1, 'name': 1, 'available': 1,
          '_id': 0},
        {'sort': {'id': 1}},
        function(err, items) {
          if (!err) {
            callback({bikeshare: items});
          } else {
            winston.error('Error querying for bikeshare information',
                          err);
          }
        });
  });
}
