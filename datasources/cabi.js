var pbsc = require('./generic/pbsc');

exports.updateCabi = updateCabi;

function updateCabi(db, callback) {
  var cabiurl = 'http://www.capitalbikeshare.com/stations/bikeStations.xml';
  pbsc.updatePBSC(db, cabiurl, callback);
}
