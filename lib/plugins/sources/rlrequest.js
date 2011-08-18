var queue = require('redmark');
var request = require('request');

exports.request_limited = request_limited;

//Trivial drop-in rate limiter.
//For simplicity, we limit all external requests to one per second;
//this keeps us well below the WMATA API limits but also keeps us
//from thrashing any other external APIs.

var jobid = queue.seed(function(options, callback) {
  request(options, callback);
}, {time: 1000,
  total: 1,
  max: 1000 });

function request_limited(options, callback) {
  queue.add(jobid, [options, callback]);
}
