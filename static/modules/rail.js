var metrorail = {
  name: 'metrorail',
  icon: 'resources/img/rail.svg',
  displayTime: 60,

  doInit: function(div, socket) {
    div = div[0];
    soy.renderElement(div, metrorail.main, {});
    soy.renderElement($('#railpredictions tbody')[0],
        metrorail.predictions,
        {'predictions': [{'Line': 'RD',
          'Car': '8',
          'DestinationName': 'Franconia-Springfield',
          'Min': 'ARR'}]});

    soy.renderElement($('#incidents')[0], metrorail.incidents,
        {'incidents': [{'Description': 'Test alert.',
          'LinesAffectedArr': ['RD']}]});

    $('#incidents').marquee({
      yScroll: 'bottom', pauseSpeed: 1500,
      scrollSpeed: 10, pauseOnHover: false,
      beforeshow: function($marquee, $li) {
        var lines = $li.find('.lines');
        $('#lines').html(lines.html()).fadeIn(1000);
      },
      aftershow: function($marquee, $li) {
        $('#lines').hide();
      }
    });

    $('#incidents').data('state', 'running');

    var newsize, dh, oneRow, empx, estCrawlHeight,
        availableSpace, error;

    newsize = (($(window).width() / $('#railpredictions').outerWidth()) * 95);
    $('#metrorail').css('font-size', newsize + '%');

    dh = $($('#railpredictions thead tr').children()[2]);
    dh.css('width', dh.innerWidth());

    oneRow = $('#railpredictions tbody tr').outerHeight();
    empx = (10 * newsize) / 62.5;
    estCrawlHeight = 6 * empx;
    availableSpace = $(window).height() - $('#header').outerHeight() -
                        $('#railpredictions').outerHeight() + oneRow -
                        estCrawlHeight;

    numTrains = Math.floor(availableSpace / oneRow);

    socket.emit('set trains', config.rtu, function(data) {
      stationName = data.name;
      updateTrains(socket);
      updateIncidents(socket);

      setInterval(function() {updateTrains(socket);}, 20000);
      setInterval(function() {updateIncidents(socket);}, 150000);
    });
  },
  onShow: function() {
    //start marquee
    $('#incidents').marquee('resume');
    $('#incidents').data('state', 'running');
  },
  onHide: function() {
    //stop marquee
    $('#incidents').marquee('pause');
    $('#incidents').data('state', 'paused');
  },
  title: function() {return stationName;}

};

var stationName = 'Metrorail';
var numTrains = 0;

function updateTrains(socket) {
  socket.emit('get trains', -2, function(response) {
    soy.renderElement($('#railpredictions tbody')[0],
        metrorail.predictions,
        {'predictions': response.trains.slice(0, numTrains)});
  });
}

function setIncidents(response) {
  if ($('#marquee').data('state') === 'running') {
    $('#incidents').marquee('pause');
  }
  $('#lines').html('');
  if (response.incidents.length === 0) {
    $('#incidents').html('<li></li>');
  } else {
    $('#incidents').html(
        metrorail.incidents({'incidents': response.incidents})
    );
  }
  $('#incidents').marquee('update');
  $('#incidents').marquee('resume');
  if ($('#marquee').data('state') === 'paused') {
    $('#incidents').marquee('pause');
  }
}

function updateIncidents(socket) {
  socket.emit('get incidents', setIncidents);
}
