require(
    {
      paths: {
        jquery: 'ext/jquery.min',
        cycle: 'ext/jquery.cycle.all',
        strftime: 'ext/strftime',
        marquee: 'ext/jquery.marquee',
        hotkeys: 'ext/jquery.hotkeys',
        soy: 'ext/soyutils',
        async: 'ext/async.min',
        socket: '/socket.io/socket.io'
      },
      priority: ['jquery']
    },
    ['sign'],
    function(sign) {
      sign();
    }
);
