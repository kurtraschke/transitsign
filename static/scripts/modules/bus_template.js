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
  if (opt_data.buses.length == 0) {
    output.append('<div class="message">No predictions</div>');
  } else {
    var busList62 = opt_data.buses;
    var busListLen62 = busList62.length;
    for (var busIndex62 = 0; busIndex62 < busListLen62; busIndex62++) {
      var busData62 = busList62[busIndex62];
      output.append('<div class="busprediction"><div class="minutes">', soy.$$escapeHtml(busData62.Minutes), '<div class="mintag">minute', (busData62.Minutes > 1) ? 's' : '', '</div></div><div class="businfo"><span class="route">', soy.$$escapeHtml(busData62.Agency), ' ', soy.$$escapeHtml(busData62.RouteID), '</span><br>', soy.$$escapeHtml(busData62.StopName), '<br>', (busData62.DirectionText && busData62.DestinationName) ? '<span class="direction">' + soy.$$escapeHtml(busData62.DirectionText) + '</span> to <span class="destination">' + soy.$$escapeHtml(busData62.DestinationName) + '</span>' : (busData62.DirectionText) ? '<span class="direction">' + soy.$$escapeHtml(busData62.DirectionText) + '</span>' : (busData62.DestinationName) ? '<span class="destination">' + soy.$$escapeHtml(busData62.DestinationName) + '</span>' : '', '</div></div>');
    }
  }
  if (!opt_sb) return output.toString();
};
