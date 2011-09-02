var xml2js = require('xml2js');

var rlrequest = require('./rlrequest');

exports.fetch = fetch;

function fetch(url, format) {
  return function(callback) {
    rlrequest.request_limited({uri: url},
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            switch (format) {
              case 'json':
                try {
                  var parsed = JSON.parse(body);
                  callback(null, parsed);
                } catch (error) {
                  callback({error: 'error parsing JSON', exception: error});
                }
                break;
              case 'xml':
                var parser = new xml2js.Parser();
                parser.on('end', function(result) {
                  callback(null, result);
                });
                parser.on('error', function(error) {
                  callback(error);
                });
                parser.parseString(body);
                break;
              default:
                callback(null, body);
            }
          } else {
            var meta = {};
            if (error) {
              meta['error'] = error;
            }
            if (response) {
              meta['statusCode'] = response.statusCode;
              meta['headers'] = response.headers;
              meta['body'] = response.body;
            }
            callback(meta);
          }
        }
    );
  };
}
