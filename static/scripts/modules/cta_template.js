// This file was automatically generated from cta.soy.
// Please don't edit this file by hand.

if (typeof ctaTemplate == 'undefined') { var ctaTemplate = {}; }


ctaTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td>Line</td><td>Destination</td><td>Minutes</td></tr></thead><tbody></tbody></table></div>');
  if (!opt_sb) return output.toString();
};


ctaTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList66 = opt_data.predictions;
  var predictionListLen66 = predictionList66.length;
  for (var predictionIndex66 = 0; predictionIndex66 < predictionListLen66; predictionIndex66++) {
    var predictionData66 = predictionList66[predictionIndex66];
    output.append('<tr><td>');
    ctaTemplate.line({line: predictionData66.rt}, output);
    output.append('</td><td>', soy.$$escapeHtml(predictionData66.destNm), '</td><td>');
    ctaTemplate.time({prediction: predictionData66}, output);
    output.append('</td></tr>');
  }
  if (!opt_sb) return output.toString();
};


ctaTemplate.time = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.prediction.isApp == '1') ? 'Approaching' : (opt_data.prediction.isDly == '1') ? 'Delayed' : soy.$$escapeHtml(opt_data.prediction.min));
  if (!opt_sb) return output.toString();
};


ctaTemplate.line = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span class="', opt_data.line, '">');
  switch (opt_data.line) {
    case 'Red':
      output.append('Red');
      break;
    case 'Blue':
      output.append('Blue');
      break;
    case 'Brn':
      output.append('Brown');
      break;
    case 'G':
      output.append('Green');
      break;
    case 'Org':
      output.append('Orange');
      break;
    case 'P':
      output.append('Purple');
      break;
    case 'Pink':
      output.append('Pink');
      break;
    case 'Y':
      output.append('Yellow');
      break;
  }
  output.append('</span>');
  if (!opt_sb) return output.toString();
};
