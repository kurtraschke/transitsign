var connexionz = require('./generic/connexionz');

exports.updateARTPredictions = updateARTPredictions;

function updateARTPredictions(db, stop_id) {
    var url = "http://realtime.commuterpage.com/rtt/public/utility/file.aspx?contenttype=SQLXML&Name=RoutePositionET.xml&PlatformNo=";
    var agency = "ART";
    connexionz.updateConnexionzPredictions(db, agency, url, stop_id);
}