'use strict';
//Setting up route
angular.module('testruns').config([
  '$stateProvider',
  function ($stateProvider) {
    // Testruns state routing
    $stateProvider.state('viewTestruns', {
      url: '/testruns/:productName/:dashboardName',
      templateUrl: 'modules/testruns/views/testruns.client.view.html'
    }).state('requirementsTestRun', {
      url: '/requirements/:productName/:dashboardName/:testRunId/:requirementsResult',
      templateUrl: 'modules/testruns/views/requirements.client.view.html'
    }).state('benchmarkPreviousBuildTestRun', {
      url: '/benchmark-previous-build/:productName/:dashboardName/:testRunId/:benchmarkResult',
      templateUrl: 'modules/testruns/views/benchmark-previous-build.client.view.html'
    }).state('benchmarkFixedBaselineTestRun', {
      url: '/benchmark-fixed-baseline/:productName/:dashboardName/:testRunId/:benchmarkResult',
      templateUrl: 'modules/testruns/views/benchmark-fixed-baseline.client.view.html'
    });
  }
]);