var winston = require('winston');
var async = require('async');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  db.collection('sign_configs').ensureIndex({'sign_name': 1}, callback);
}

function configure(db, socket) {
  socket.on('get config', function(signName, callback) {
    var collection = db.collection('sign_configs');
    collection.findOne({'sign_name': signName},
        function(err, configDoc) {
          if (!err && configDoc) {
            callback(configDoc.config);
          } else {
            winston.error('Error fetching sign config', err);
          }
        });
  });
}
