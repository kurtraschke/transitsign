var metrorail = {
  name: 'metrorail',
  icon: 'resources/img/rail.svg',

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

    $('#incidents').marquee({yScroll: 'bottom', pauseSpeed: 1500,
                      scrollSpeed: 10, pauseOnHover: false,
      beforeshow: function($marquee, $li) {
        var lines = $li.find('.lines');
        $('#lines').html(lines.html()).fadeIn(1000);
      },
      aftershow: function($marquee, $li) {
        $('#lines').hide();
      }
    });


    var newsize, dh, oneRow, empx, estCrawlHeight,
        availableSpace, error, numTrains;

    newsize = (($(window).width() / $('#railpredictions').outerWidth()) * 95);
    $('#metrorail').css('font-size', newsize + '%');


    dh = $($('#railpredictions thead tr').children()[2]);
    dh.css('width', dh.innerWidth());

    oneRow = $('#railpredictions tbody tr').outerHeight();
    empx = (10 * newsize) / 62.5;
    estCrawlHeight = 6 * empx;
    availableSpace = $(window).height() - $('#header').outerHeight();
    availableSpace -= $('#railpredictions').outerHeight() - estCrawlHeight;
    availableSpace += oneRow;

    numTrains = Math.floor(availableSpace / oneRow);

    socket.emit('set trains', config.rtu, function(data) {
      stationName = data.name;
      finishInit();
    });

    function finishInit() {
      updateTrains(socket);
      updateIncidents(socket);

      setInterval(function() {updateTrains(socket);}, 20000);
      setInterval(function() {updateIncidents(socket);}, 150000);

    };

    function updateTrains(socket) {
      socket.emit('get trains', -2, function(response) {
        soy.renderElement($('#railpredictions tbody')[0],
            metrorail.predictions,
            {'predictions': response.trains.slice(0, numTrains)});
      });
    }

    //TODO: make this all considerably less of a hack.
    //See also jquery.marquee.js line 142.
    //In short: the marquee stops working if all of the old elements are
    //removed and replaced at once.
    //It also stops working if there are no elements within.
    //So we perform the update in three main steps:
    //Mark the old elements for removal
    //Add the new elements, or a dummy (empty) element.
    //Tell the marquee to update itself, remove the old elements,
    //and tell the marquee to update itself again.
    //Despite all this, the update appears seamless to the user,
    //and it all still works.
    var setIncidents = function(response) {
      $('#incidents').marquee('pause');
      $('#lines').html('');
      var old = $('#incidents li').addClass('delete');
      if (response.incidents.length === 0) {
        $('#incidents').append('<li></li>');
      } else {
        $('#incidents').append(
            metrorail.incidents({'incidents': response.incidents})
                        );
      }
      $('#incidents').marquee('update');
      $('#incidents').marquee('resume');
      $('#incidents').marquee('pause');
      $('#incidents li.delete').remove();
      $('#incidents').marquee('update');
      $('#incidents').marquee('resume');


    };

    function updateIncidents(socket) {
      socket.emit('get incidents', setIncidents);
    }
  },
  onShow: function() {
    //start marquee,
    $('#incidents').marquee('resume');
  },
  onHide: function() {
    //stop marquee
    $('#incidents').marquee('pause');
  },
  title: function() {return stationName;}

};

var stationName = 'Metrorail';
