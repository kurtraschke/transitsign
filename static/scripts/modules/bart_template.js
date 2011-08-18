// This file was automatically generated from bart.soy.
// Please don't edit this file by hand.

if (typeof bartTemplate == 'undefined') { var bartTemplate = {}; }


bartTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td>Train</td><td>Minutes</td></tr></thead><tbody></tbody></table><div class="ic"><ul class="incidents"></ul></div>');
  if (!opt_sb) return output.toString();
};


bartTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList5 = opt_data.predictions;
  var predictionListLen5 = predictionList5.length;
  for (var predictionIndex5 = 0; predictionIndex5 < predictionListLen5; predictionIndex5++) {
    var predictionData5 = predictionList5[predictionIndex5];
    output.append('<tr><td style="color: ', soy.$$escapeHtml(predictionData5.hexcolor), ';">', soy.$$escapeHtml(predictionData5.destinationName), '</td><td>');
    bartTemplate.time({time: predictionData5.minutes}, output);
    output.append('</td></tr>');
  }
  if (!opt_sb) return output.toString();
};


bartTemplate.incidents = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var incidentList16 = opt_data.incidents;
  var incidentListLen16 = incidentList16.length;
  for (var incidentIndex16 = 0; incidentIndex16 < incidentListLen16; incidentIndex16++) {
    var incidentData16 = incidentList16[incidentIndex16];
    output.append('<li>', soy.$$escapeHtml(incidentData16.description), '</li>');
  }
  if (!opt_sb) return output.toString();
};


bartTemplate.time = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.time == -1) ? 'Arrived' : soy.$$escapeHtml(opt_data.time));
  if (!opt_sb) return output.toString();
};
