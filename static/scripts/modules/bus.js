define(['jquery', 'soy', '../tools', './bus_template'],
       function(_jquery, _soy, tools, _template) {

      BusSlide.instanceCount = 1;

      function BusSlide(div, socket, parameters) {
        this.div = div;
        this.socket = socket;
        this.icon = 'resources/img/' +
           ((parameters.tram) ? 'tram.svg' : 'bus.svg');
        this.title = parameters.title || 'Buses near here';
        this.name = parameters.name || 'bus-';
        this.name += BusSlide.instanceCount++;
        this.parameters = parameters;

        $(div).attr('id', this.name).addClass('bus');

        soy.renderElement(div, busTemplate.main,
                          {'credit': parameters.credit || ''});
        
        var columns;

        if (parameters.oneCol) {
          $(div).addClass('onecol');
          columns = 1;
        } else {
          $(div).addClass('twocol');
          columns = 2;
        }

        this.numBuses = tools.autoSizer(
           $('.buspredictions', div)[0],
           busTemplate.predictions,
            {'buses': [{'Minutes': 10, 'Agency': 'Test Agency',
             'RouteID': 'Route', 'StopName': 'Stop Name',
             'DirectionText': 'Direction Text'}]},
           $('.credit', div).outerHeight());

        this.numBuses *= columns;

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

             soy.renderElement($('.buspredictions', div)[0],
                               busTemplate.predictions,
                               {'buses': response.slice(0, numBuses)}
             );
           });
      };
         
      BusSlide.prototype.onShow = function() {
          var div = this.div;
          var count = $('.busprediction', div).length;
        
          if (count == 0) {
            setTimeout(function(){$('#slidecontainer').cycle('next')}, 2000);
          }
        
      };

      return BusSlide;
    });
