if (typeof slideModules == 'undefined') { var slideModules = {}; }

slideModules['Bus'] = BusSlide;

function BusSlide(div, socket, parameters) {
  this.div = div;
  this.socket = socket;
  this.icon = 'resources/img/bus.svg';
  this.title = parameters.title || "Buses near here";
  this.name = parameters.name || "bus";
  
  $(div).attr('id', this.name).addClass('bus');
  
  //render dummy element for sizing
  soy.renderElement(div, busTemplate.main,
    {'buses': [{'Minutes': 10, 'Agency': 'Test Agency',
      'RouteID': 'Route', 'StopName': 'Stop Name',
      'DirectionText': 'Direction Text'}]});

    this.numBuses = Math.floor(($(window).height() - $('#header').outerHeight()) /
                          $(div).children(':first').outerHeight()) * 2;

    socket.emit('set buses', parameters.stops);

    var self = this;
    self.updateBuses(); 
    this.updateTimer = setInterval(function(){self.updateBuses();}, 60000);
}

BusSlide.prototype.updateBuses  = function() {
    var div = this.div;
  var numBuses = this.numBuses;
  this.socket.emit('get buses',
    function(response) {
      response = response.buses;

      soy.renderElement(div, busTemplate.main,
          {'buses': response.slice(0, numBuses)}
              );
    });
}