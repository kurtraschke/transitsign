var bus = {
  name: 'bus',
  icon: 'resources/img/bus.svg',
  displayTime: 30,

  doInit: function(div, socket) {
    div = div[0];

    socket.emit('set buses', config.stops);

    function updateBuses() {
      socket.emit('get buses', function(response) {
        response = response.buses;
        soy.renderElement(div, bus.main, {'buses': response.slice(0, 8)});
      });
    }

    updateBuses();
    setInterval(updateBuses, 60000);

  },
  onShow: function() {},
  onHide: function() {},
  title: function() {return 'Buses near here';}




};
