define(['jquery', 'soy', './bikeshare_template'],
       function(_jquery, _soy, _template) {

      BikeshareSlide.instanceCount = 1;

      function BikeshareSlide(div, socket, parameters) {
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/bike.svg';
        this.title = parameters.title || parameters.system;
        this.name = parameters.name || 'bikeshare-';
        this.name += BikeshareSlide.instanceCount++;

        $(div).attr('id', this.name).addClass('bikeshare');
        
        soy.renderElement(div, bikeshareTemplate.main, {'system': parameters.system,
                                                        'credit': parameters.credit});

        var self = this;
        self.updateBikeshare();
        this.updateTimer = setInterval(function() {self.updateBikeshare();},
                                       60000);
      }

      BikeshareSlide.prototype.updateBikeshare = function() {
        var div = $('.stations', this.div)[0];
        var stations = this.parameters.stations;
        var system = this.parameters.system;
        this.socket.emit('get bikeshare', system, stations,
           function(response) {
             response = response.bikeshare;
             soy.renderElement(div, bikeshareTemplate.stations,
             {'stations': response});
           });

      };

      return BikeshareSlide;
    });
