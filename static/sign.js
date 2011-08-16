//Setup process:
//Get config with list of modules, parameters for each.
//Get module HTML template from module and insert into slideshow.
//Perform module initialization tasks.
//Once done, start slideshow.

$(document).ready(function() {
  doTopRight();

  var socket = io.connect();

  socket.on('error', function(err) {
    console.log(err);
  });

  socket.on('connect', function() {
    //This gets called when we reconnect as well;
    //take heed!
    console.log('connected');
    socket.emit('set weather', config.weather_id, function() {
        updateWX(socket);
        setInterval(function() {updateWX(socket);}, 1800000);
            });


    var slidecontainer = $('#slidecontainer');
    var iconcontainer = $('#icons');

    $.each(config.modules, function(key, moduleConfig) {
      var moduleDiv = $('<div />')[0];
      slidecontainer.append(moduleDiv);
      var modConstructor = slideModules[moduleConfig.type];

      var theModule = new modConstructor(moduleDiv, socket,
                                         moduleConfig.parameters);
      theModule.displayTime = moduleConfig.displayTime || 30;
      $(moduleDiv).data('module', theModule);
      iconcontainer.append($('<img>').attr(
          {'src': theModule.icon,
            'id': iconID(theModule) }));
    });

    slidecontainer.cycle({
      fx: 'fade',
      timeout: 20000,
      containerResize: 0,
      slideResize: 0,
      before: onBefore,
      timeoutFn: findTimeout
    });
  });

  socket.on('disconnect', function() {
    $('body').html('<div style="text-align:center; font-size: 8em;">' +
                   'Sign disconnected.</div>');
  });

});

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

function onBefore(currSlideElement, nextSlideElement, options, forwardFlag) {
  var currModule = $(currSlideElement).data('module');
  var nextModule = $(nextSlideElement).data('module');
  $('#' + iconID(currModule)).removeClass('active');
  if ('onHide' in currModule) {currModule.onHide();}
  $('#slidetitle').fadeOut(250,
      function() {
        $('#slidetitle').html(nextModule.title).fadeIn(250);
      }
  );
  if ('onShow' in nextModule) {nextModule.onShow();}
  $('#' + iconID(nextModule)).addClass('active');
}

function findTimeout(currSlideElement, nextSlideElement, options, forwardFlag) {
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
