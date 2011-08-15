if (typeof slideModules == 'undefined') { var slideModules = {}; }

slideModules['CaBi'] = CaBiSlide;

function CaBiSlide(div, socket, parameters) {
  this.div = div;
  this.socket = socket;
  this.parameters = parameters;
  this.icon = 'resources/img/bike.svg';
  this.title = parameters.title || "Capital Bikeshare";
  this.name = parameters.name || "cabi";
  
  $(div).attr('id', this.name).addClass('cabi');
  
  var self = this;
  self.updateCaBi();
  this.updateTimer = setInterval(function(){self.updateCaBi();}, 60000); 
}

CaBiSlide.prototype.updateCaBi = function() {
  var div = this.div;
  var stations = this.parameters.stations;
  this.socket.emit('get cabi', stations,
                   function(response) {
                     response = response.cabi;
                     soy.renderElement(div, cabiTemplate.main,
                                       {'stations': response});
                   });
  
}
