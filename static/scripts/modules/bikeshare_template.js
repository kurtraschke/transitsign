// This file was automatically generated from bikeshare.soy.
// Please don't edit this file by hand.

if (typeof bikeshareTemplate == 'undefined') { var bikeshareTemplate = {}; }


bikeshareTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="stations"></div><div class="credit">', (opt_data.credit) ? soy.$$escapeHtml(opt_data.credit) : 'Data provided by ' + soy.$$escapeHtml(opt_data.system), '</div>');
  if (!opt_sb) return output.toString();
};


bikeshareTemplate.stations = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var stationList12 = opt_data.stations;
  var stationListLen12 = stationList12.length;
  for (var stationIndex12 = 0; stationIndex12 < stationListLen12; stationIndex12++) {
    var stationData12 = stationList12[stationIndex12];
    output.append('<div class="station"><div class="name">', soy.$$escapeHtml(stationData12.name), '</div>', (stationData12.available) ? 'Bikes available: ' + soy.$$escapeHtml(stationData12.bikes) + '<br>Docks available: ' + soy.$$escapeHtml(stationData12.docks) : 'Station unavailable.', '</div>');
  }
  if (!opt_sb) return output.toString();
};
