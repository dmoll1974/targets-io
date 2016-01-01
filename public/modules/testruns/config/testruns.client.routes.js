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
      template: '<requirements></requirements>'
    }).state('benchmarkPreviousBuildTestRun', {
      url: '/benchmark-previous-build/:productName/:dashboardName/:testRunId/:benchmarkResult',
      template: '<benchmark-previous-build></benchmark-previous-build>'
    }).state('benchmarkFixedBaselineTestRun', {
      url: '/benchmark-fixed-baseline/:productName/:dashboardName/:testRunId/:benchmarkResult',
      template: '<benchmark-fixed-baseline></benchmark-fixed-baseline>'
    }).state('addTestRun', {
      url: '/add-testrun/:productName/:dashboardName',
      template: '<add-testrun></add-testrun>'
    });;
  }
]);
