require(
    {
      paths: {
        jquery: 'ext/jquery.min',
        jqueryui: 'ext/jquery-ui-1.8.16.min',
        cookies: 'ext/jquery.cookies.2.2.0.min',
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
