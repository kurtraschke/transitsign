define(['jquery', 'marquee', 'soy', './bart_template'],
       function(_jquery, _marquee, _soy, _template) {
         BARTSlide.instanceCount = 1;

      function BARTSlide(div, socket, parameters) {
        var self = this;
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/rail.svg';
        this.title = parameters.title || 'BART';
        this.name = parameters.name || 'bart-';
        this.name += BARTSlide.instanceCount++;
        this.rtus = parameters.rtus;

        if (!(this.rtus instanceof Array)) {
          this.rtus = [this.rtus];
        }

        $(div).attr('id', this.name).addClass('bart').addClass('rail');

        soy.renderElement(div, bartTemplate.main, {});
        

        this.marquee = $('.incidents', this.div);


        this.marquee.marquee({
          yScroll: 'bottom', pauseSpeed: 1500,
          scrollSpeed: 8, pauseOnHover: false,
        });

        this.marquee.data('state', 'running');

        /*var newsize, dh, oneRow, empx, estCrawlHeight,
           availableSpace, error;

        newsize = (($(window).width() / $('.railpredictions',
           this.div).outerWidth()) * 95);
        $(div).css('font-size', newsize + '%');

        dh = $('.railpredictions thead tr td:nth-child(3)', this.div);
        dh.css('width', dh.innerWidth());

        oneRow = $('.railpredictions tbody tr', this.div).outerHeight();
        empx = (10 * newsize) / 62.5;
        estCrawlHeight = 6 * empx;
        availableSpace = $(window).height() - $('#header').outerHeight() -
           $('.railpredictions', this.div).outerHeight() + oneRow -
           estCrawlHeight;

        this.numTrains = Math.floor(availableSpace / oneRow);*/
        this.numTrains = 6;

        self.updateTrains();
        self.updateIncidents();

        setInterval(function() {self.updateTrains();}, 20000);
        setInterval(function() {self.updateIncidents();}, 150000);

      }

      BARTSlide.prototype.onHide = function() {
        //stop marquee
        this.marquee.marquee('pause');
        this.marquee.data('state', 'paused');
      };

      BARTSlide.prototype.onShow = function() {
        //start marquee
        this.marquee.marquee('resume');
        this.marquee.data('state', 'running');
      };

      BARTSlide.prototype.updateTrains = function() {
        var self = this;
        this.socket.emit('get bart trains', this.parameters.abbr,
           this.parameters.filter, function(response) {
             
             soy.renderElement($('.railpredictions tbody', self.div)[0],
             bartTemplate.predictions,
             {'predictions': response.trains.slice(0, self.numTrains)});
           });
      };

      BARTSlide.prototype.updateIncidents = function() {
        var self = this;
        this.socket.emit('get bart incidents',
           function(response) {self.setIncidents(response);});
      };

      BARTSlide.prototype.setIncidents = function(response) {
        if (this.marquee.data('state') === 'running') {
          this.marquee.marquee('pause');
        }
        if (response.incidents.length === 0) {
          this.marquee.html('<li></li>');
        } else {
          this.marquee.html(
             bartTemplate.incidents({'incidents': response.incidents})
          );
        }
        this.marquee.marquee('update');
        this.marquee.marquee('resume');
        if (this.marquee.data('state') === 'paused') {
          this.marquee.marquee('pause');
        }
      };

         return BARTSlide;
});