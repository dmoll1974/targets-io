'use strict';
//Setting up route
angular.module('metrics').config([
  '$stateProvider',
  function ($stateProvider) {
    // Metrics state routing
    $stateProvider.state('addMetric', {
      url: '/add/metric/:productName/:dashboardName/',
      template: '<add-metric></add-metric>'
    }).state('editMetric', {
      url: '/edit/metric/:productName/:dashboardName/:metricId/',
      template: '<edit-metric></edit-metric>'
    });
  }
]);
