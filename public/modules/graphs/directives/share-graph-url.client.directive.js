'use strict';
angular.module('graphs').directive('shareGraphUrl', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        //On click
        //$(elem).click(function() {
        //	$(this).select();
        //});
        $timeout(function () {
          element.css('width', element[0].value.length * 8 + 'px');
          element[0].select();
        });
      }
    };
  }
]);
