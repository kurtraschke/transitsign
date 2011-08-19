// This file was automatically generated from bus.soy.
// Please don't edit this file by hand.

if (typeof busTemplate == 'undefined') { var busTemplate = {}; }


busTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="buspredictions"></div><div class="credit">', soy.$$escapeHtml(opt_data.credit), '</div>');
  if (!opt_sb) return output.toString();
};


busTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var busList49 = opt_data.buses;
  var busListLen49 = busList49.length;
  for (var busIndex49 = 0; busIndex49 < busListLen49; busIndex49++) {
    var busData49 = busList49[busIndex49];
    output.append('<div class="busprediction"><div class="minutes">', soy.$$escapeHtml(busData49.Minutes), '</div><div><span class="route">', soy.$$escapeHtml(busData49.Agency), ' ', soy.$$escapeHtml(busData49.RouteID), '</span><br>', soy.$$escapeHtml(busData49.StopName), '<br>', soy.$$escapeHtml(busData49.DirectionText), '</div></div>');
  }
  if (!opt_sb) return output.toString();
};
