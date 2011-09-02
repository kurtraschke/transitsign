require(
    {
      paths: {
        jquery: 'ext/jquery.min',
        strftime: 'ext/strftime',
        soy: 'ext/soyutils',
        async: 'ext/async.min',
        socket: '/socket.io/socket.io',
        prettyPrint: 'ext/prettyprint'
      },
      priority: ['jquery']
    },
    ['jquery', 'socket', 'strftime', 'prettyPrint', 'soy',
     'modules/logs_template'],
    function(_jQuery, _socket, _strftime, _prettyPrint, _soy, _template) {

      var enableAutomaticUpdates = false;

      function timestampFromID(objectID) {
        var timestampHex = objectID.substr(0, 8);
        var d = new Date(parseInt(timestampHex, 16) * 1000);
        return strftimeUTC('%F %T UTC', d);
      }


      function updateLogs(socket) {
        var logLevel = $('#logLevel').val();
        var logQuantity = parseInt($('#logQuantity').val());
        var logFilter = $('#logFilter').val();

        $('#logUpdates').attr('disabled', 'disabled');

        socket.emit('get logs', logLevel, logQuantity,
                    logFilter, null, function(logs) {

              for (var i = 0; i < logs.length; i++) {
                var logEntry = logs[i];
                logEntry.timestampHTML = timestampFromID(logEntry['_id']);
              }

              $('#logs tbody').html(logsTemplate.logs({'logs': logs}));

              for (var i = 0; i < logs.length; i++) {
                var logEntry = logs[i];
                $('#' + logEntry['_id'] + ' .data').append(
                prettyPrint(logEntry.meta, {'expanded': false})
                );
              }

              $('#logUpdates').removeAttr('disabled');

            });
      }

      function doAutomaticUpdate(socket, logLevel, logFilter) {
        var lastID = $('#logs > tbody > tr').first().attr('id');

        socket.emit('get logs', logLevel, null, logFilter,
                    lastID, function(logs) {
              for (var i = 0; i < logs.length; i++) {
                var logEntry = logs[i];
                logEntry.timestampHTML = timestampFromID(logEntry['_id']);
              }

              $('#logs > tbody').prepend(logsTemplate.logs({'logs': logs}));

              for (var i = 0; i < logs.length; i++) {
                var logEntry = logs[i];
                $('#' + logEntry['_id'] + ' .data').append(
                prettyPrint(logEntry.meta, {'expanded': false})
                );
              }

              if (enableAutomaticUpdates) {
                setTimeout(function() {doAutomaticUpdate(socket, logLevel,
                                                         logFilter);}, 2000);
              }
            });

      }

      //when automatic update button is checked:
      function enableUpdates(socket) {
        //disable submit button
        $('#logSubmit').attr('disabled', 'disabled');

        //capture form values
        var logLevel = $('#logLevel').val();
        var logFilter = $('#logFilter').val();
        //start automatic updates
        enableAutomaticUpdates = true;
        doAutomaticUpdate(socket, logLevel, logFilter);
      }

      //when automatic update button is unchecked:
      function disableUpdates(socket) {
        //stop automatic updates
        enableAutomaticUpdates = false;
        //re-enable submit button
        $('#logSubmit').removeAttr('disabled');

      }

      $(document).ready(function() {
        $('#logSubmit').attr('disabled', 'disabled');

        var socket = io.connect();
        socket.on('connect', function() {
          $('#logForm').submit(function() {updateLogs(socket); return false;});
          $('#logSubmit').removeAttr('disabled');
        });

        $('#logUpdates').change(function() {
          if ($(this).is(':checked')) {
            enableUpdates(socket);
          } else {
            disableUpdates();
          }
        });
      });
    }
);
