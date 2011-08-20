var winston = require('winston');
var async = require('async');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    function(callback) {
      db.collection('cta_train_subscriptions').remove({}, {'safe': true}, callback);
    },
    function(callback) {
      db.collection('cta_trains').ensureIndex({'mapid': 1}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('subscribe cta stop', function(mapid, callback) {
    subscribeStops(mapid, db, socket);
  });

  socket.on('get cta trains', function(mapid, minutes, callback) {
    var collection = db.collection('cta_trains');
    collection.findItems({'staId': mapid, 'min': {'$gte': minutes}},
        {'min': 1, 'rt': 1, 'staNm': 1, 'stpDe': 1,
          'destNm': 1, 'isApp': 1, 'isDly': 1, '_id': 0},
        {'sort': {'min': 1}},
        function(err, items) {
          if (!err) {
            callback({trains: items});
          } else {
            winston.error('Error querying for CTA rail predictions', err);
          }
        });
  });

  socket.on('disconnect', function() {
    unsubscribeStops(db, socket);
  });
}


function subscribeStops(mapid, db, socket) {
  var collection = db.collection('cta_train_subscriptions');
  collection.update({'mapid': mapid},
      {'$push': {'sockets': socket.id},
        '$inc': {'subscriberCount': 1}},
      {'upsert': true});
}

function unsubscribeStops(db, socket) {
  var collection = db.collection('cta_train_subscriptions');

  collection.update({'sockets': socket.id},
      {'$pull': {'sockets': socket.id},
        '$inc': {'subscriberCount': -1}},
      {'upsert': true, 'multi': true});
}
