// This file was automatically generated from mbta.soy.
// Please don't edit this file by hand.

if (typeof mbtaTemplate == 'undefined') { var mbtaTemplate = {}; }


mbtaTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td>Line</td><td>Destination</td><td>Minutes</td></tr></thead><tbody></tbody></table><div class="credit">Data provided by MassDOT</div>');
  if (!opt_sb) return output.toString();
};


mbtaTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList5 = opt_data.predictions;
  var predictionListLen5 = predictionList5.length;
  for (var predictionIndex5 = 0; predictionIndex5 < predictionListLen5; predictionIndex5++) {
    var predictionData5 = predictionList5[predictionIndex5];
    output.append('<tr><td class="', predictionData5.Line, '">', soy.$$escapeHtml(predictionData5.Line), '</td><td>', soy.$$escapeHtml(predictionData5.Destination), '</td><td>', soy.$$escapeHtml(predictionData5.Minutes), '</td></tr>');
  }
  if (!opt_sb) return output.toString();
};
