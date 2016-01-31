'use strict';
angular.module('graphs').directive('fixToTop', [
  '$window',
  function ($window) {
    var $win = angular.element($window);
    // wrap window object as jQuery object
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var topClass = attrs.fixToTop,
        // get element's top relative to the document
            offsetTop = element.offset().top;

        $win.on('scroll', function (e) {
          if ($win[0].pageYOffset >= offsetTop) {
            element.addClass(topClass);
          } else {
            element.removeClass(topClass);
          }
        });
      }
    };
  }
]);
