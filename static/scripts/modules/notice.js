define(['jquery'],
       function(_jquery) {

      NoticeSlide.instanceCount = 1;

      function NoticeSlide(div, socket, parameters) {
        this.div = div;
        this.socket = socket;
        this.parameters = parameters;
        this.icon = 'resources/img/notice.svg';
        this.name = parameters.name || 'notice-';
        this.name += NoticeSlide.instanceCount++;
        this.title = 'Notice';

        $(div).attr('id', this.name).addClass('notice').html(this.parameters.message);
      }

      return NoticeSlide;
    });
