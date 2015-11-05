'use strict';
angular.module('core').filter('currentProductToTop', [function () {
  return function (sections, current) {
    var newList = [];
    angular.forEach(sections, function (section) {
      if (section.name == current) {
        newList.unshift(section);
      }
      else {
        newList.push(section);
      }
    });
    return newList;
  };

  }]);
