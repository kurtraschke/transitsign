define(['jquery', 'soy', '../tools', './mbta-cr_template'],
       function(_jquery, _soy, tools, _template) {

      MBTACRSlide.instanceCount = 1;

      function MBTACRSlide(div, socket, parameters) {
        var self = this;
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/rail.svg';
        this.title = parameters.title || 'MBTA Commuter Rail';
        this.name = parameters.name || 'mbtacr-';
        this.name += MBTACRSlide.instanceCount++;

        $(div).attr('id', this.name).addClass('mbtacr').addClass('rail');

        soy.renderElement(div, mbtacrTemplate.main, {});

        this.numTrains = tools.autoSizer(
           $('.railpredictions tbody', self.div)[0],
           mbtacrTemplate.predictions,
           {predictions: [{Line: 'Needham Line',
                            Destination: 'Needham Heights'}]},
           $('.credit', self.div).outerHeight(true));

        self.updateTrains();
        setInterval(function() {self.updateTrains();}, 60000);
      }



      MBTACRSlide.prototype.updateTrains = function() {
        var self = this;
        this.socket.emit('get mbcr trains', this.parameters.stop,
                         function(response) {
             soy.renderElement($('.railpredictions tbody', self.div)[0],
             mbtacrTemplate.predictions,
             {'predictions': response.trains.slice(0, self.numTrains)});
           });
      };

      return MBTACRSlide;

    });
