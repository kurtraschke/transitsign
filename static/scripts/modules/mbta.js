define(['jquery', 'soy', '../tools', './mbta_template'],
       function(_jquery, _soy, tools, _template) {

      MBTASlide.instanceCount = 1;

      function MBTASlide(div, socket, parameters) {
        var self = this;
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/rail.svg';
        this.title = parameters.title || 'MBTA';
        this.name = parameters.name || 'mbta-';
        this.name += MBTASlide.instanceCount++;

        $(div).attr('id', this.name).addClass('mbta').addClass('rail');

        soy.renderElement(div, mbtaTemplate.main, {});

        this.numTrains = tools.autoSizer(
           $('.railpredictions tbody', self.div)[0],
           mbtaTemplate.predictions,
           {predictions: [{Line: 'Blue', Destination: 'Bowdoin', min: 3}]},
           0);

        socket.emit('subscribe mbta stop', this.parameters.platformKeys);

        self.updateTrains();
        setInterval(function() {self.updateTrains();}, 60000);
      }



      MBTASlide.prototype.updateTrains = function() {
        var self = this;
        this.socket.emit('get mbta trains', this.parameters.platformKeys,
           this.parameters.filter, function(response) {

             soy.renderElement($('.railpredictions tbody', self.div)[0],
             mbtaTemplate.predictions,
             {'predictions': response.trains.slice(0, self.numTrains)});
           });
      };

      return MBTASlide;

    });
