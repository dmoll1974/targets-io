'use strict';
angular.module('products').filter('markdown', function() {
  var converter = new Showdown.converter();
  return converter.makeHtml;
});


