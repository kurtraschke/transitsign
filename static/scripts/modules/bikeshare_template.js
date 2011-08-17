// This file was automatically generated from bikeshare.soy.
// Please don't edit this file by hand.

if (typeof bikeshareTemplate == 'undefined') { var bikeshareTemplate = {}; }


bikeshareTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var stationList3 = opt_data.stations;
  var stationListLen3 = stationList3.length;
  for (var stationIndex3 = 0; stationIndex3 < stationListLen3; stationIndex3++) {
    var stationData3 = stationList3[stationIndex3];
    output.append('<div class="station"><div class="name">', soy.$$escapeHtml(stationData3.name), '</div>', (stationData3.available) ? 'Bikes available: ' + soy.$$escapeHtml(stationData3.bikes) + '<br>Docks available: ' + soy.$$escapeHtml(stationData3.docks) : 'Station unavailable.', '</div>');
  }
  if (!opt_sb) return output.toString();
};
