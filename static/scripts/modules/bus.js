define(['jquery', 'soy', './bus_template'],
       function(_jquery, _soy, _template) {

      BusSlide.instanceCount = 1;

      function BusSlide(div, socket, parameters) {
        this.div = div;
        this.socket = socket;
        this.icon = 'resources/img/' + ((parameters.tram) ? 'bus.svg' : 'tram.svg');
        this.title = parameters.title || 'Buses near here';
        this.name = parameters.name || 'bus-';
        this.name += BusSlide.instanceCount++;
        this.parameters = parameters;

        $(div).attr('id', this.name).addClass('bus');

        //render dummy element for sizing
        soy.renderElement(div, busTemplate.main,
           {'buses': [{'Minutes': 10, 'Agency': 'Test Agency',
             'RouteID': 'Route', 'StopName': 'Stop Name',
             'DirectionText': 'Direction Text'}]});

        this.numBuses = Math.floor(
           ($(window).height() - $('#header').outerHeight()) /
           $(div).children(':first').outerHeight()) * 2;

        socket.emit('subscribe buses', parameters.stops);

        var self = this;
        self.updateBuses();
        this.updateTimer = setInterval(function() {self.updateBuses();}, 60000);
      }

      BusSlide.prototype.updateBuses = function() {
        var div = this.div;
        var numBuses = this.numBuses;
        this.socket.emit('get buses', this.parameters.stops,
           this.parameters.filter,
           function(response) {
             response = response.buses;

             soy.renderElement(div, busTemplate.main,
             {'buses': response.slice(0, numBuses)}
             );
           });
      };

      return BusSlide;
    });
