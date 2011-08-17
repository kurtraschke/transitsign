// This file was automatically generated from bus.soy.
// Please don't edit this file by hand.

if (typeof busTemplate == 'undefined') { var busTemplate = {}; }


busTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var busList3 = opt_data.buses;
  var busListLen3 = busList3.length;
  for (var busIndex3 = 0; busIndex3 < busListLen3; busIndex3++) {
    var busData3 = busList3[busIndex3];
    output.append('<div class="busprediction"><div class="minutes">', soy.$$escapeHtml(busData3.Minutes), '</div><div><span class="route">', soy.$$escapeHtml(busData3.Agency), ' ', soy.$$escapeHtml(busData3.RouteID), '</span><br>', soy.$$escapeHtml(busData3.StopName), '<br>', soy.$$escapeHtml(busData3.DirectionText), '</div></div>');
  }
  if (!opt_sb) return output.toString();
};
