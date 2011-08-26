// This file was automatically generated from logs.soy.
// Please don't edit this file by hand.

if (typeof logsTemplate == 'undefined') { var logsTemplate = {}; }


logsTemplate.logs = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var logEntryList3 = opt_data.logs;
  var logEntryListLen3 = logEntryList3.length;
  for (var logEntryIndex3 = 0; logEntryIndex3 < logEntryListLen3; logEntryIndex3++) {
    var logEntryData3 = logEntryList3[logEntryIndex3];
    output.append('<tr id="', logEntryData3._id, '"><td class="timestamp">', logEntryData3.timestampHTML, '</td><td class="level-', logEntryData3.level, '">', soy.$$escapeHtml(logEntryData3.level), '</td><td>', soy.$$escapeHtml(logEntryData3.message), '</td><td class="data"></td></tr>');
  }
  if (!opt_sb) return output.toString();
};
