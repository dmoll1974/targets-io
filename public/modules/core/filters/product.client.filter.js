'use strict';
angular.module('core').filter('currentProductToTop', [function () {
  return function (sections, current) {
    var newList = [];
    if(current === ''){
      return sections;
    }else {
      var patt = new RegExp('^' + current);
      angular.forEach(sections, function (section) {
        if (patt.test(section.name)) {
          newList.unshift(section);
        }
        else {
          newList.push(section);
        }
      });
      return newList;
    }
  };

  }]);
