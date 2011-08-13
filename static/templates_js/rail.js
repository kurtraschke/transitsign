// This file was automatically generated from rail.soy.
// Please don't edit this file by hand.

if (typeof railTemplate == 'undefined') { var railTemplate = {}; }


railTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table id="railpredictions"><thead><tr><td>LN</td><td>CAR</td><td>DEST</td><td>MIN</td></tr></thead><tbody></tbody></table><div id="incidentcontainer"><div id="lines"></div><ul id="incidents"></ul></div>');
  if (!opt_sb) return output.toString();
};


railTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList31 = opt_data.predictions;
  var predictionListLen31 = predictionList31.length;
  for (var predictionIndex31 = 0; predictionIndex31 < predictionListLen31; predictionIndex31++) {
    var predictionData31 = predictionList31[predictionIndex31];
    output.append('<tr><td class="', predictionData31.Line, '">', soy.$$escapeHtml(predictionData31.Line), '</td><td>', soy.$$escapeHtml(predictionData31.Car), '</td><td><span class="dest">', soy.$$escapeHtml(predictionData31.DestinationName), '</span></td><td ');
    railTemplate.timeClass({time: predictionData31.Min}, output);
    output.append('>');
    railTemplate.time({time: predictionData31.Min}, output);
    output.append('</td></tr>');
  }
  if (!opt_sb) return output.toString();
};


railTemplate.incidents = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var incidentList50 = opt_data.incidents;
  var incidentListLen50 = incidentList50.length;
  for (var incidentIndex50 = 0; incidentIndex50 < incidentListLen50; incidentIndex50++) {
    var incidentData50 = incidentList50[incidentIndex50];
    output.append('<li><span class="lines">');
    railTemplate.lines({lines: incidentData50.LinesAffectedArr}, output);
    output.append(' Alert: </span>', soy.$$escapeHtml(incidentData50.Description), '</li>');
  }
  if (!opt_sb) return output.toString();
};


railTemplate.lines = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var lineList59 = opt_data.lines;
  var lineListLen59 = lineList59.length;
  for (var lineIndex59 = 0; lineIndex59 < lineListLen59; lineIndex59++) {
    var lineData59 = lineList59[lineIndex59];
    output.append('<span class="', lineData59, '">', soy.$$escapeHtml(lineData59), '</span>', (! (lineIndex59 == lineListLen59 - 1)) ? ', ' : '');
  }
  if (!opt_sb) return output.toString();
};


railTemplate.time = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.time == -2) ? 'BRD' : (opt_data.time == -1) ? 'ARR' : soy.$$escapeHtml(opt_data.time));
  if (!opt_sb) return output.toString();
};


railTemplate.timeClass = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.time < 0) ? 'class="flash"' : '');
  if (!opt_sb) return output.toString();
};
