if (typeof slideModules == 'undefined') { var slideModules = {}; }

slideModules['Bikeshare'] = BikeshareSlide;

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

  var self = this;
  self.updateBikeshare();
  this.updateTimer = setInterval(function() {self.updateBikeshare();}, 60000);
}

BikeshareSlide.prototype.updateBikeshare = function() {
  var div = this.div;
  var stations = this.parameters.stations;
  var system = this.parameters.system;
  this.socket.emit('get bikeshare', system, stations,
                   function(response) {
                     response = response.bikeshare;
                     soy.renderElement(div, bikeshareTemplate.main,
                                       {'stations': response});
                   });

};
