if (typeof slideModules == 'undefined') { var slideModules = {}; }

slideModules['Metrorail'] = MetrorailSlide;

function MetrorailSlide(div, socket, parameters) {
  this.div = div;
  this.socket = socket;
  this.parameters = parameters;
  this.icon = 'resources/img/rail.svg';
  this.title = parameters.title || 'Metrorail';
  this.name = parameters.name || 'metrorail';

  $(div).attr('id', this.name).addClass('metrorail');


  soy.renderElement(div, railTemplate.main, {});
  soy.renderElement($('#railpredictions tbody')[0],
      railTemplate.predictions,
      {'predictions': [{'Line': 'RD',
        'Car': '8',
        'DestinationName': 'Franconia-Springfield',
        'Min': 'ARR'}]});

  this.marquee = $('#incidents');

  soy.renderElement(this.marquee[0], railTemplate.incidents,
      {'incidents': [{'Description': 'Test alert.',
        'LinesAffectedArr': ['RD']}]});



  this.marquee.marquee({
    yScroll: 'bottom', pauseSpeed: 1500,
    scrollSpeed: 8, pauseOnHover: false,
    beforeshow: function($marquee, $li) {
      var lines = $li.find('.lines');
      $('#lines').html(lines.html()).fadeIn(1000);
    },
    aftershow: function($marquee, $li) {
      $('#lines').hide();
    }
  });

  this.marquee.data('state', 'running');

  var newsize, dh, oneRow, empx, estCrawlHeight,
      availableSpace, error;

  newsize = (($(window).width() / $('#railpredictions').outerWidth()) * 95);
  $(div).css('font-size', newsize + '%');

  dh = $('#railpredictions thead tr td:nth-child(3)');
  dh.css('width', dh.innerWidth());

  oneRow = $('#railpredictions tbody tr').outerHeight();
  empx = (10 * newsize) / 62.5;
  estCrawlHeight = 6 * empx;
  availableSpace = $(window).height() - $('#header').outerHeight() -
      $('#railpredictions').outerHeight() + oneRow -
      estCrawlHeight;

  this.numTrains = Math.floor(availableSpace / oneRow);

  var self = this;

  socket.emit('set trains', this.parameters.rtu, function(data) {
    self.title = data.name;
    self.updateTrains(socket);
    self.updateIncidents(socket);

    setInterval(function() {self.updateTrains(socket);}, 20000);
    setInterval(function() {self.updateIncidents(socket);}, 150000);
  });

}

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
  this.socket.emit('get trains', -2, function(response) {
    soy.renderElement($('#railpredictions tbody')[0],
        railTemplate.predictions,
        {'predictions': response.trains.slice(0, self.numTrains)});
  });
};

MetrorailSlide.prototype.updateIncidents = function() {
  var self = this;
  this.socket.emit('get incidents',
                   function(response) {self.setIncidents(response);});
};

MetrorailSlide.prototype.setIncidents = function(response) {
  if (this.marquee.data('state') === 'running') {
    this.marquee.marquee('pause');
  }
  $('#lines').html('');
  if (response.incidents.length === 0) {
    this.marquee.html('<li></li>');
  } else {
    this.marquee.html(
        railTemplate.incidents({'incidents': response.incidents})
    );
  }
  this.marquee.marquee('update');
  this.marquee.marquee('resume');
  if (this.marquee.data('state') === 'paused') {
    this.marquee.marquee('pause');
  }
};
