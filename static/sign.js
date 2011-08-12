//Setup process:
//Get config with list of modules, parameters for each.
//Get module HTML template from module and insert into slideshow.
//Perform module initialization tasks.
//Once done, start slideshow.

function iconID(theModule) {
  return theModule.name + '_icon';
}

$(document).ready(function() {
  $('#wx').cycle({
    fx: 'fade',
    timeout: 10000,
    containerResize: 0,
    slideResize: 0
  });

  setInterval(function() {
    var clock = $('.clock').first();
    clock.html(strftime('%l:%M %p'));
  }, 1000);

  var slidecontainer = $('#slidecontainer');
  var iconcontainer = $('#icons');

  onBefore = function(currSlideElement, nextSlideElement,
                      options, forwardFlag) {
    var currModule = $(currSlideElement).data('module');
    var nextModule = $(nextSlideElement).data('module');
    $('#' + iconID(currModule)).removeClass('active');
    currModule.onHide();
    $('#slidetitle').fadeOut(250,
                             function() {
                     $('#slidetitle').html(nextModule.title()).fadeIn(250);
                             }
               );
    nextModule.onShow();
    $('#' + iconID(nextModule)).addClass('active');
  };

  console.log('attempting connection');
  var socket = io.connect();


  socket.on('error', function(err) {
    console.log(err);
  });

  socket.on('connect', function() {
    //This gets called when we reconnect as well;
    //take heed!

    console.log('Connected !');
    socket.emit('set weather', config.wx_station);

    function updateWX() {
      socket.emit('get weather', function(response) {
        response = response.wx[0];
        $('#wx span.obs').html(response.weather);
        var temp_string = response.temp_f.substring(0, 2) + ' ºF';
        $('#wx span.temp').html(temp_string);
      });
    }

    updateWX();
    setInterval(updateWX, 1800000);

    var modules = [metrorail, bus, cabi];

    $.each(modules, function(key, theModule) {
      var moduleDiv = $('<div />').attr('id', theModule.name);
      moduleDiv.data('module', theModule);
      slidecontainer.append(moduleDiv);
      iconcontainer.append($('<img>').attr(
          {'src': theModule.icon,
            'id': iconID(theModule) }));
      theModule.doInit(moduleDiv, socket);
    });

    //TODO: use callback for timeout so we can vary timing by slide.

    slidecontainer.cycle({
      fx: 'fade',
      timeout: 20000,
      containerResize: 0,
      slideResize: 0,
      before: onBefore
    });


  });

});
