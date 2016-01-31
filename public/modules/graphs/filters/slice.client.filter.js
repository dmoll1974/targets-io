'use strict';
angular.module('graphs').filter('slice', [function () {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
  }]);
