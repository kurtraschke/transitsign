var winston = require('winston');

exports.configure = configure;

function configure(db, socket) {

  socket.on('get logs', function(level, quantity, filter, lastID, callback) {
    var collection = db.collection('log');
    var levels = [];

    var targetLevel = winston.levels[level];
    var levelNames = Object.keys(winston.levels);

    for (var i = 0; i < levelNames.length; i++) {
      var levelValue = winston.levels[levelNames[i]];
      if (levelValue >= targetLevel) {
        levels.push(levelNames[i]);
      }
    }

    var selector = {'level': {'$in': levels}};
    var options = {'sort': {'_id': -1}};

    if (quantity != null) {
      options['limit'] = quantity;
    }
    if (lastID != null) {
      selector['_id'] = {'$gt': collection.id(lastID)};
    }
    if (filter != null && filter.length > 0) {
      selector['message'] = {'$regex': filter};
    }

    collection.findItems(selector,
        {'_id': 1, 'level': 1, 'message': 1, 'meta': 1},
        options,
        function(error, items) {
          if (!error) {
            callback(items);
          }
        }
    );
  });
}
