// This file was automatically generated from bus.soy.
// Please don't edit this file by hand.

if (typeof busTemplate == 'undefined') { var busTemplate = {}; }


busTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var busList19 = opt_data.buses;
  var busListLen19 = busList19.length;
  for (var busIndex19 = 0; busIndex19 < busListLen19; busIndex19++) {
    var busData19 = busList19[busIndex19];
    output.append('<div class="busprediction"><div class="minutes">', soy.$$escapeHtml(busData19.Minutes), '</div><div><span class="route">', soy.$$escapeHtml(busData19.Agency), ' ', soy.$$escapeHtml(busData19.RouteID), '</span><br>', soy.$$escapeHtml(busData19.StopName), '<br>', soy.$$escapeHtml(busData19.DirectionText), '</div></div>');
  }
  if (!opt_sb) return output.toString();
};
