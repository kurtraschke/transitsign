define(['jquery', 'jqueryui', 'cookies', 'cycle', 'hotkeys',
        'strftime', 'socket', 'require', 'async'],
function($, _jqueryui, _cookies, _cycle, _hotkeys, 
    _strftime, _socket, require, _async) {

  function updateWX(socket) {
    socket.emit('get weather', function(response) {
      response = response.wx[0];
      $('#topright span.obs').html(response.weather);
      var temp_string = response.temp_f.substring(0, 2) + ' ºF';
      $('#topright span.temp').html(temp_string);
    });
  }

  function iconID(theModule) {
    return theModule.name + '_icon';
  }

  function onBefore(currSlideElement, nextSlideElement,
                        options, forwardFlag) {
    var currModule = $(currSlideElement).data('module');
    var nextModule = $(nextSlideElement).data('module');
    $('#' + iconID(currModule)).removeClass('active');
    if ('onHide' in currModule) {currModule.onHide();}
    $('#slidetitle').fadeOut(250,
        function() {
          $('#slidetitle').html(nextModule.title).fadeIn(250);
        }
    );
    if ('onShow' in nextModule) {
      setTimeout(function() {nextModule.onShow();}, 250);
    }
    $('#' + iconID(nextModule)).addClass('active');
  }

  function findTimeout(currSlideElement, nextSlideElement,
                           options, forwardFlag) {
    var currModule = $(currSlideElement).data('module');
    return currModule.displayTime * 1000;
  }

  /**
       * Set up the top-right block:
       * alternate between the weather
       * and the clock,
       * and update the clock every second.
       */
  function doTopRight() {
    setInterval(function() {
      var clock = $('.clock').first();
      clock.html(strftime('%l:%M %p'));
    }, 1000);

    $('#topright').cycle({
      fx: 'fade',
      timeout: 5000,
      containerResize: 0,
      slideResize: 0
    });
  }

  function sizeDialog() {
    var signSize;
    var oldSize;

    $.cookies.setOptions({expiresAt: new Date(2030, 1, 1)});

    var cookieSize = $.cookies.get('signSize');

    if (cookieSize != null) {
      signSize = cookieSize;
      $('#container').css('font-size', signSize + '%');
    } else {
      signSize = 100;
    }

    var dialog = $('<div></div>');
    dialog.html('<div><span id="size"></span>%</div><div id="slider"></div>');
    dialog.dialog({
      autoOpen: false,
      resizable: false,
      closeOnEscape: false,
      width: 700,
      title: 'Sign size',
      buttons: [
        {
          text: 'Cancel',
          click: function() {
            signSize = oldSize;
            $('#container').css('font-size', oldSize + '%');
            $(this).dialog('close');

          }
        },
        {
          text: 'Save',
          click: function() {
            $.cookies.set('signSize', $('#slider').slider('value'));
            $(this).dialog('close');
          }
        }
      ],
      open: function(event, ui) {
        oldSize = signSize;
        $('#slider').slider('value', signSize);
        $('#size').html(signSize);
        $('.ui-dialog-titlebar-close', ui.dialog).hide();
      }
    });

    $('#slider').slider({
      min: 30,
      max: 200,
      value: 100,
      animate: 'fast',
      slide: function(event, ui) {
        signSize = ui.value;
        $('#container').css('font-size', ui.value + '%');
        $('#size').html(ui.value);
      }});

    $(document).bind('keydown', 's', function() {
      dialog.dialog('open');
    });
  }

  function doSetup(socket, config) {
    socket.emit('set weather', config.weather_id, function() {
      updateWX(socket);
      setInterval(function() {updateWX(socket);}, 1800000);
    });

    var slidecontainer = $('#slidecontainer');
    var iconcontainer = $('#icons');

    async.forEachSeries(config.slides,
        function(moduleConfig, callback) {
          var moduleDiv = $('<div />')[0];
          slidecontainer.append(moduleDiv);

          require([moduleConfig.type],
              function(modConstructor) {
                var theModule = new modConstructor(moduleDiv, socket,
                    moduleConfig.parameters);
                theModule.displayTime = moduleConfig.displayTime || 30;
                $(moduleDiv).data('module', theModule);
                iconcontainer.append($('<img>').attr(
                    {'src': theModule.icon,
                      'id': iconID(theModule) }));
                $(moduleDiv).hide();
                callback(null);
              });
        }, function(err) {
          if (err) {
            console.log(err);
          } else {
            //all slides configured, start cycle
            slidecontainer.cycle({
              fx: 'fade',
              timeout: 20000,
              containerResize: 0,
              slideResize: 0,
              before: onBefore,
              timeoutFn: findTimeout
            });

            $(document).bind('keydown', 'space', function() {
              slidecontainer.cycle('toggle');
            });
            $(document).bind('keydown', 'left', function() {
              slidecontainer.cycle('prev');
            });
            $(document).bind('keydown', 'right', function() {
              slidecontainer.cycle('next');
            });

          }
        });
  }

  function onReady() {
    doTopRight();
    sizeDialog();
    var socket = io.connect();

    socket.on('connect', function() {
      //This gets called when we reconnect as well;
      //take heed!
      console.log('connected');

      var signName = window.location.hash.substr(1);

      socket.emit('get config', signName, function(config) {
        doSetup(socket, config);
      });
    });

    socket.on('disconnect', function() {
      $('body').html('<div class="message">Sign disconnected.</div>');
    });
    socket.on('error', function(err) {
      console.log(err);
    });
  }
  return function() {
    $(document).ready(onReady);
  };
});
