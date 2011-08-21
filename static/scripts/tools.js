define(['jquery', 'soy'], function(_jquery, _soy) {
  return {
    emSize: function(element) {
      var fontSize = getComputedStyle($(element)[0], null).fontSize;
      return parseInt(fontSize.replace('px', ''));
    },

    autoSizer: function(containerEl, template, dummyData, adjustments) {
      soy.renderElement(containerEl, template, dummyData);

      var oneRow = $(containerEl).children().first().outerHeight();
      var availableSpace = $(window).height() - $('#header').outerHeight() -
          $(containerEl).parent().outerHeight() + oneRow - adjustments;
      $(containerEl).children().remove();
      return Math.floor(availableSpace / oneRow);
    }

  };
});
