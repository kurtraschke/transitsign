if (typeof slideModules == 'undefined') { var slideModules = {}; }

slideModules['Metrorail'] = MetrorailSlide;

MetrorailSlide.instanceCount = 1;

function MetrorailSlide(div, socket, parameters) {
  var self = this;
  this.div = div;
  this.socket = socket;
  this.parameters = parameters;
  this.icon = 'resources/img/rail.svg';
  this.title = parameters.title || 'Metrorail';
  this.name = parameters.name || 'metrorail-';
  this.name += MetrorailSlide.instanceCount++;
  this.rtus = parameters.rtus;

  if (!(this.rtus instanceof Array)) {
    this.rtus = [this.rtus];
  }

  $(div).attr('id', this.name).addClass('metrorail');

  soy.renderElement(div, metrorailTemplate.main, {});
  soy.renderElement($('.railpredictions tbody', this.div)[0],
      metrorailTemplate.predictions,
      {'predictions': [{'Line': 'RD',
        'Car': '8',
        'DestinationName': 'Franconia-Springfield',
        'Min': 'ARR'}]});

  this.marquee = $('.incidents', this.div);

  soy.renderElement(this.marquee[0], metrorailTemplate.incidents,
      {'incidents': [{'Description': 'Test alert.',
        'LinesAffectedArr': ['RD']}]});

  this.marquee.marquee({
    yScroll: 'bottom', pauseSpeed: 1500,
    scrollSpeed: 8, pauseOnHover: false,
    beforeshow: function($marquee, $li) {
      var lines = $li.find('.lines');
      $('.lnbox', self.div).html(lines.html()).fadeIn(1000);
    },
    aftershow: function($marquee, $li) {
      $('.lnbox', self.div).hide();
    }
  });

  this.marquee.data('state', 'running');

  var newsize, dh, oneRow, empx, estCrawlHeight,
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

  this.numTrains = Math.floor(availableSpace / oneRow);


  if (self.parameters.auto === true) {
    socket.emit('get metrorail information',
                this.parameters.rtus, function(data) {
                  self.title = data.name;
                  self.parameters.rtus = data.rtus;
                  self.finishInit();
        });

  } else {
    this.finishInit();
  }

}

MetrorailSlide.prototype.finishInit = function() {
  var self = this;
  self.updateTrains();
  self.updateIncidents();

  setInterval(function() {self.updateTrains();}, 20000);
  setInterval(function() {self.updateIncidents();}, 150000);


};

MetrorailSlide.prototype.onHide = function() {
  //stop marquee
  this.marquee.marquee('pause');
  this.marquee.data('state', 'paused');
};

MetrorailSlide.prototype.onShow = function() {
  //start marquee
  this.marquee.marquee('resume');
  this.marquee.data('state', 'running');
};

MetrorailSlide.prototype.updateTrains = function() {
  var self = this;
  this.socket.emit('get metrorail trains', this.parameters.rtus,
                   this.parameters.filter, function(response) {
        soy.renderElement($('.railpredictions tbody', self.div)[0],
            metrorailTemplate.predictions,
            {'predictions': response.trains.slice(0, self.numTrains)});
      });
};

MetrorailSlide.prototype.updateIncidents = function() {
  var self = this;
  this.socket.emit('get metrorail incidents',
                   function(response) {self.setIncidents(response);});
};

MetrorailSlide.prototype.setIncidents = function(response) {
  if (this.marquee.data('state') === 'running') {
    this.marquee.marquee('pause');
  }
  $('.lnbox', this.div).html('');
  if (response.incidents.length === 0) {
    this.marquee.html('<li></li>');
  } else {
    this.marquee.html(
        metrorailTemplate.incidents({'incidents': response.incidents})
    );
  }
  this.marquee.marquee('update');
  this.marquee.marquee('resume');
  if (this.marquee.data('state') === 'paused') {
    this.marquee.marquee('pause');
  }
};
