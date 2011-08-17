// This file was automatically generated from metrorail.soy.
// Please don't edit this file by hand.

if (typeof metrorailTemplate == 'undefined') { var metrorailTemplate = {}; }


metrorailTemplate.main = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table class="railpredictions"><thead><tr><td>LN</td><td>CAR</td><td>DEST</td><td>MIN</td></tr></thead><tbody></tbody></table><div class="ic"><div class="lnbox"></div><ul class="incidents"></ul></div>');
  if (!opt_sb) return output.toString();
};


metrorailTemplate.predictions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var predictionList36 = opt_data.predictions;
  var predictionListLen36 = predictionList36.length;
  for (var predictionIndex36 = 0; predictionIndex36 < predictionListLen36; predictionIndex36++) {
    var predictionData36 = predictionList36[predictionIndex36];
    output.append('<tr><td class="', predictionData36.Line, '">', soy.$$escapeHtml(predictionData36.Line), '</td><td>', soy.$$escapeHtml(predictionData36.Car), '</td><td><span class="dest">', soy.$$escapeHtml(predictionData36.DestinationName), '</span></td><td ');
    metrorailTemplate.timeClass({time: predictionData36.Min}, output);
    output.append('>');
    metrorailTemplate.time({time: predictionData36.Min}, output);
    output.append('</td></tr>');
  }
  if (!opt_sb) return output.toString();
};


metrorailTemplate.incidents = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var incidentList55 = opt_data.incidents;
  var incidentListLen55 = incidentList55.length;
  for (var incidentIndex55 = 0; incidentIndex55 < incidentListLen55; incidentIndex55++) {
    var incidentData55 = incidentList55[incidentIndex55];
    output.append('<li><span class="lines">');
    metrorailTemplate.lines({lines: incidentData55.LinesAffectedArr}, output);
    output.append(' Alert: </span>', soy.$$escapeHtml(incidentData55.Description), '</li>');
  }
  if (!opt_sb) return output.toString();
};


metrorailTemplate.lines = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var lineList64 = opt_data.lines;
  var lineListLen64 = lineList64.length;
  for (var lineIndex64 = 0; lineIndex64 < lineListLen64; lineIndex64++) {
    var lineData64 = lineList64[lineIndex64];
    output.append('<span class="', lineData64, '">', soy.$$escapeHtml(lineData64), '</span>', (! (lineIndex64 == lineListLen64 - 1)) ? ', ' : '');
  }
  if (!opt_sb) return output.toString();
};


metrorailTemplate.time = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.time == -2) ? 'BRD' : (opt_data.time == -1) ? 'ARR' : soy.$$escapeHtml(opt_data.time));
  if (!opt_sb) return output.toString();
};


metrorailTemplate.timeClass = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.time < 0) ? 'class="flash"' : '');
  if (!opt_sb) return output.toString();
};
