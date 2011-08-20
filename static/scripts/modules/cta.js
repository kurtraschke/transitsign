define(['jquery', 'soy', './cta_template'],
       function(_jquery, _soy, _template) {

      CTASlide.instanceCount = 1;

      function CTASlide(div, socket, parameters) {
        var self = this;
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/rail.svg';
        this.title = parameters.title || 'CTA';
        this.name = parameters.name || 'cta-';
        this.name += CTASlide.instanceCount++;

        $(div).attr('id', this.name).addClass('cta').addClass('rail');

        soy.renderElement(div, ctaTemplate.main, {});

        this.numTrains = 6; //TODO: replace with auto-sizing

        socket.emit('subscribe cta stop', this.parameters.mapid);

        self.updateTrains();
        setInterval(function() {self.updateTrains();}, 60000);
      }



      CTASlide.prototype.updateTrains = function() {
        var self = this;
        this.socket.emit('get cta trains', this.parameters.mapid,
           this.parameters.filter, function(response) {

             soy.renderElement($('.railpredictions tbody', self.div)[0],
             ctaTemplate.predictions,
             {'predictions': response.trains.slice(0, self.numTrains)});
           });
      };

      return CTASlide;

    });
