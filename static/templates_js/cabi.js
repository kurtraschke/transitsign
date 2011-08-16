// This file was automatically generated from cabi.soy.
// Please don't edit this file by hand.

if (typeof cabiTemplate == 'undefined') { var cabiTemplate = {}; }


cabiTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var stationList18 = opt_data.stations;
  var stationListLen18 = stationList18.length;
  for (var stationIndex18 = 0; stationIndex18 < stationListLen18; stationIndex18++) {
    var stationData18 = stationList18[stationIndex18];
    output.append('<div class="station"><div class="name">', soy.$$escapeHtml(stationData18.name), '</div>', (stationData18.installed == 'true' && stationData18.locked == 'false') ? 'Bikes available: ' + soy.$$escapeHtml(stationData18.nbBikes) + '<br>Docks available: ' + soy.$$escapeHtml(stationData18.nbEmptyDocks) : 'Station unavailable.', '</div>');
  }
  if (!opt_sb) return output.toString();
};
