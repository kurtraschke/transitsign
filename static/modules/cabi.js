var cabi = {
  name: 'cabi',
  icon: 'resources/img/bike.svg',

  doInit: function(div, socket) {
    div = div[0];

    function updateCabi() {
      socket.emit('get cabi', config.cabi_ids, function(response) {
        response = response.cabi;
        soy.renderElement(div, cabi.main, {'stations': response});
      });
    }

    updateCabi();
    setInterval(updateCabi, 60000);

  },
  onShow: function() {},
  onHide: function() {},
  title: function() {return 'Capital Bikeshare';}




};
