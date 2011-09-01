// This file was automatically generated from cta.soy.
// Please don't edit this file by hand.

if (typeof ctaTemplate == 'undefined') { var ctaTemplate = {}; }


ctaTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td>Line</td><td>Destination</td><td>Minutes</td></tr></thead><tbody></tbody></table><div class="ic"><div class="lnbox"></div><ul class="incidents"></ul></div>');
  if (!opt_sb) return output.toString();
};


ctaTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList5 = opt_data.predictions;
  var predictionListLen5 = predictionList5.length;
  for (var predictionIndex5 = 0; predictionIndex5 < predictionListLen5; predictionIndex5++) {
    var predictionData5 = predictionList5[predictionIndex5];
    output.append('<tr><td>');
    ctaTemplate.line({line: predictionData5.rt}, output);
    output.append('</td><td>', soy.$$escapeHtml(predictionData5.destNm), '</td><td>');
    ctaTemplate.time({prediction: predictionData5}, output);
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


ctaTemplate.incidents = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var incidentList48 = opt_data.incidents;
  var incidentListLen48 = incidentList48.length;
  for (var incidentIndex48 = 0; incidentIndex48 < incidentListLen48; incidentIndex48++) {
    var incidentData48 = incidentList48[incidentIndex48];
    output.append('<li><span class="lines">');
    ctaTemplate.services({services: incidentData48.ImpactedService.Service}, output);
    output.append(' Alert: </span>', soy.$$escapeHtml(incidentData48.ShortDescription), '</li>');
  }
  if (!opt_sb) return output.toString();
};


ctaTemplate.services = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var serviceList57 = opt_data.services;
  var serviceListLen57 = serviceList57.length;
  for (var serviceIndex57 = 0; serviceIndex57 < serviceListLen57; serviceIndex57++) {
    var serviceData57 = serviceList57[serviceIndex57];
    output.append((serviceData57.ServiceType == 'R') ? '<span class="colorblock ' + serviceData57.ServiceId + '">' + ((serviceData57.ServiceId == 'Pexp') ? '<span class="exp">EXP</span>' : '') + '</span>' : '');
  }
  if (!opt_sb) return output.toString();
};
