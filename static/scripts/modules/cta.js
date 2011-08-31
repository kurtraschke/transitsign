define(['jquery', 'marquee', 'soy', '../tools', './cta_template'],
       function(_jquery, _marquee, _soy, tools, _template) {

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

        this.numTrains = tools.autoSizer(
           $('.railpredictions tbody', self.div)[0],
           ctaTemplate.predictions,
           {predictions: [{rt: 'Blue', destNm: 'O\'Hare', min: 3}]},
           6.5 * tools.emSize($('body')));

        this.marquee = $('.incidents', this.div);

        this.marquee.marquee({
          yScroll: 'bottom', pauseSpeed: 1500,
          scrollSpeed: 8, pauseOnHover: false,
          beforeshow: function($marquee, $li) {
            var lines = $li.find('.lines');
            $('.lnbox', self.div).html(lines.html()).fadeIn(1000);
          },
          aftershow: function($marquee, $li) {
            //$('.lnbox', self.div).hide();
          }
        });

        this.marquee.data('state', 'running');

        socket.emit('subscribe cta stop', this.parameters.mapid);

        self.updateTrains();
        self.updateIncidents();
        setInterval(function() {self.updateTrains();}, 60000);
        setInterval(function() {self.updateIncidents();}, 120000);
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


      CTASlide.prototype.onHide = function() {
        //stop marquee
        this.marquee.marquee('pause');
        this.marquee.data('state', 'paused');
      };

      CTASlide.prototype.onShow = function() {
        //start marquee
        this.marquee.marquee('resume');
        this.marquee.data('state', 'running');
      };

      CTASlide.prototype.updateIncidents = function() {
        var self = this;
        this.socket.emit('get cta incidents',
           function(response) {self.setIncidents(response);});
      };

      CTASlide.prototype.setIncidents = function(response) {
        if (this.marquee.data('state') === 'running') {
          this.marquee.marquee('pause');
        }
        $('.lnbox', this.div).html('');
        if (response.incidents.length === 0) {
          this.marquee.html('<li></li>');
        } else {
          this.marquee.html(
             ctaTemplate.incidents({'incidents': response.incidents})
          );
        }
        this.marquee.marquee('update');
        this.marquee.marquee('resume');
        if (this.marquee.data('state') === 'paused') {
          this.marquee.marquee('pause');
        }
      };

      return CTASlide;

    });
