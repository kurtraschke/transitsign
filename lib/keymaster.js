var fs = require('fs');
var winston = require('winston');

var minify = require('./ext/minify.json').minify;

module.exports = function() {
  var theKeys;

  return {
    importKeys: function(keyFile) {
      theKeys = JSON.parse(minify(fs.readFileSync(keyFile).toString()));
      winston.info('Loaded keys for: ' + Object.keys(theKeys).join(', '));
    },
    keyForAgency: function(agency) {return theKeys[agency];}
  };
}();
