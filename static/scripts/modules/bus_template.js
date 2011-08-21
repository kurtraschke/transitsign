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
  var busList7 = opt_data.buses;
  var busListLen7 = busList7.length;
  for (var busIndex7 = 0; busIndex7 < busListLen7; busIndex7++) {
    var busData7 = busList7[busIndex7];
    output.append('<div class="busprediction"><div class="minutes">', soy.$$escapeHtml(busData7.Minutes), '<div class="mintag">minute', (busData7.Minutes > 1) ? 's' : '', '</div></div><div class="businfo"><span class="route">', soy.$$escapeHtml(busData7.Agency), ' ', soy.$$escapeHtml(busData7.RouteID), '</span><br>', soy.$$escapeHtml(busData7.StopName), '<br>', (busData7.DirectionText && busData7.DestinationName) ? '<span class="direction">' + soy.$$escapeHtml(busData7.DirectionText) + '</span> to <span class="destination">' + soy.$$escapeHtml(busData7.DestinationName) + '</span>' : (busData7.DirectionText) ? '<span class="direction">' + soy.$$escapeHtml(busData7.DirectionText) + '</span>' : (busData7.DestinationName) ? '<span class="destination">' + soy.$$escapeHtml(busData7.DestinationName) + '</span>' : '', '</div></div>');
  }
  if (!opt_sb) return output.toString();
};
