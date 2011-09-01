var winston = require('winston');
var async = require('async');

var subscriptions = require('../../subscriptions');

exports.configure = configure;
exports.init = init;

function init(db, callback) {
  async.series([
    function(callback) {
      db.collection('cta_trains').ensureIndex({'mapid': 1}, callback);
    },
    function(callback) {
      db.collection('cta_incidents').ensureIndex(
          {'ImpactedService.Service.ServiceType': 1}, callback);
    }
  ], callback);
}

function configure(db, socket) {
  socket.on('subscribe cta stop', function(mapid, callback) {
    subscriptions.subscribe('CTA Rail', {'mapid': mapid}, db, socket);
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

  socket.on('get cta incidents', function(stopID, callback) {
    var collection = db.collection('cta_incidents');
    collection.findItems({'$or': [
      {'ImpactedService.Service.ServiceType': 'R',
        'SeverityScore': {'$gte': 10}},
      {'ImpactedService.Service.ServiceType': 'T',
        'ImpactedService.Service.ServiceId': stopID},
      {'ImpactedService.Service.ServiceType': 'X',
        '$or': [{'ImpactedService.Service.ServiceName': 'Systemwide'},
                {'ImpactedService.Service.ServiceName': 'Rail'}]}
    ]},
    {'_id': 0},
    {'sort': {SeverityScore: -1}},
    function(err, items) {
      if (!err) {
        callback({incidents: items});
      } else {
        winston.error('Error querying for CTA rail incidents', err);
      }
    });
  });

  socket.on('disconnect', function() {
    subscriptions.unsubscribe('CTA Rail', db, socket);
  });
}
