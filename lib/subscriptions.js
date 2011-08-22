exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.getActiveSubscriptions = getActiveSubscriptions;


function subscribe(namespace, data, db, socket) {
  if (!(data instanceof Array)) {
    data = [data];
  }

  var collection = db.collection('subscriptions');

  for (var i = 0; i < data.length; i++) {
    collection.update({
      'namespace': namespace,
      'data': data[i]
    },
    {'$push': {'sockets': socket.id},
      '$inc': {'subscriberCount': 1}},
    {'upsert': true});
  }
}

function unsubscribe(namespace, db, socket) {
  var collection = db.collection('subscriptions');

  collection.update({'sockets': socket.id, 'namespace': namespace},
      {'$pull': {'sockets': socket.id}, '$inc': {'subscriberCount': -1}},
      {'upsert': true, 'multi': true});
}

function getActiveSubscriptions(namespace, db, callback) {
  var collection = db.collection('subscriptions');
  var subscriptions = [];

  collection.findItems(
      {'namespace': namespace,
        'subscriberCount': {'$gte': 1}},
      {'data': 1, '_id': 0},
      function(err, items) {
        if (!err) {
          for (var i = 0; i < items.length; i++) {
            subscriptions.push(items[i].data);
          }
          callback(subscriptions);
        }
      }
  );
}
