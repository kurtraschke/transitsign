// This file was automatically generated from mbta-cr.soy.
// Please don't edit this file by hand.

if (typeof mbtacrTemplate == 'undefined') { var mbtacrTemplate = {}; }


mbtacrTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td><span class="train">Train</span></td><td></td><td><span class="time">Time</span></td></tr></thead><tbody></tbody></table><div class="credit">Data provided by MassDOT</div>');
  if (!opt_sb) return output.toString();
};


mbtacrTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList5 = opt_data.predictions;
  var predictionListLen5 = predictionList5.length;
  for (var predictionIndex5 = 0; predictionIndex5 < predictionListLen5; predictionIndex5++) {
    var predictionData5 = predictionList5[predictionIndex5];
    output.append('<tr><td><span class="train">', soy.$$escapeHtml(predictionData5.Trip), '</span></td><td class="line">', soy.$$escapeHtml(predictionData5.Line), ' to<br>', soy.$$escapeHtml(predictionData5.Destination), '</td><td><span class="time">');
    mbtacrTemplate.time({flag: predictionData5.Flag, time: predictionData5.TimeString}, output);
    output.append('</span></td></tr>');
  }
  if (!opt_sb) return output.toString();
};


mbtacrTemplate.time = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  switch (opt_data.flag) {
    case 'sch':
    case 'pre':
      output.append(soy.$$escapeHtml(opt_data.time));
      break;
    case 'app':
      output.append('Approaching');
      break;
    case 'arr':
      output.append('Arriving');
      break;
    case 'dep':
      output.append('Departed');
      break;
    case 'del':
      output.append('Delayed');
      break;
  }
  if (!opt_sb) return output.toString();
};
