var nextbus = require('./generic/nextbus');

exports.updateCirculatorPredictions = updateCirculatorPredictions;

function updateCirculatorPredictions(db, stop_id, callback) {
    var agency = "DC Circulator";
    var agency_id = "dc-circulator";
    
    nextbus.updateNextBusPredictions(db, agency, agency_id, stop_id, callback);
}
