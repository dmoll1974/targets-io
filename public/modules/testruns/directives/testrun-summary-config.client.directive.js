'use strict';

angular.module('testruns').directive('testrunSummaryConfig', TestRunSummaryDirective);

function TestRunSummaryDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/testrun-summary-config.client.view.html',
    controller: TestRunSummaryDirectiveController
  };

  return directive;

  /* @ngInject */
  function TestRunSummaryDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils) {


    Utils.graphType = 'testrun';

    $scope.numberOfColumns = 1;
    $scope.requirements = [];



      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {

        $scope.dashboard = dashboard;

        /* merge requirements results from test run data*/

        $scope.metrics = $scope.dashboard.metrics;



      });










    $scope.cancel = function () {
      /* reset form*/
      $scope.testrunForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

  }
}
