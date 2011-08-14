var bus = {
  name: 'bus',
  icon: 'resources/img/bus.svg',
  displayTime: 30,

  doInit: function(div, socket) {
    div = div[0];

    //render dummy element for sizing
    soy.renderElement(div, busTemplate.main,
        {'buses': [{'Minutes': 10, 'Agency': 'Test Agency',
          'RouteID': 'Route', 'StopName': 'Stop Name',
          'DirectionText': 'Direction Text'}]});

    numBuses = Math.floor(($(window).height() - $('#header').outerHeight()) /
                          $(div).children(':first').outerHeight()) * 2;

    socket.emit('set buses', config.stops);

    function updateBuses() {
      socket.emit('get buses', function(response) {
        response = response.buses;
        soy.renderElement(div, busTemplate.main,
                          {'buses': response.slice(0, numBuses)});
      });
    }

    updateBuses();
    setInterval(updateBuses, 60000);

  },
  onShow: function() {},
  onHide: function() {},
  title: function() {return 'Buses near here';}
};

var numBuses = 0;
