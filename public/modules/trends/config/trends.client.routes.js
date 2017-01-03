'use strict';
//Setting up route
angular.module('trends').config([
  '$stateProvider',
  function ($stateProvider) {

    $stateProvider.state('viewTrends', {
      url: '/trends/:productName/:dashboardName/:tag?trendsZoomRange&metricFilter',
      template: '<trends-container></trends-container>'
    });
  }
]);
