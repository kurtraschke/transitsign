var fs = require('fs');
var winston = require('winston');

var minify = require('./ext/minify.json').minify;

module.exports = function() {
  var theKeys = {};

  return {
    importKeys: function(keyFile) {
      theKeys = JSON.parse(minify(fs.readFileSync(keyFile).toString()));
      winston.info('Loaded keys for: ' + Object.keys(theKeys).join(', '));
    },
    importKeysEnv: function() {
      var envKeys = Object.keys(process.env);
      for (var i=0; i < envKeys.length; i++) {
        var envKey = envKeys[i];
        var prefix = "npm_package_config__key_";
        if (envKey.indexOf(prefix) == 0) {
          var agency = envKey.replace(prefix, '');
          var key = process.env[envKey];
          theKeys[agency] = key;
        }
      }
      winston.info('Loaded keys for: ' + Object.keys(theKeys).join(', '));
    },
    keyForAgency: function(agency) {return theKeys[agency];}
  };
}();
