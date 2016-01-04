(function () {
  'use strict';
  /* public/modules/testruns/directives/running-test.client.directive.js */
  /**
     * @desc
     * @example <div running-test></div>
     */
  angular.module('testruns').directive('runningTest', [ 'Dashboards', 'TestRuns', '$timeout', '$interval', RunningTestDirective]);
  function RunningTestDirective(Dashboards, TestRuns, $timeout, $interval) {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/testruns/views/running-test-directive.client.view.html',
      controller: RunningTestController,
      controllerAs: 'vm'
    };
    return directive;
    /* @ngInject */
    function RunningTestController($scope, $modal, $stateParams, $state, TestRuns, Events, ConfirmModal) {
      $scope.showDialog = false;

      var testRunPolling = function(){
        TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function (runningTest) {
          if (Object.keys(runningTest).length !== 0) {
            $scope.runningTest = runningTest;
            $scope.runningTest.duration = TestRuns.calculateDuration(runningTest);
            $scope.showDialog = true;
          }else{
            $scope.showDialog = false;
          }
        });
      };

      testRunPolling();
      var polling = $interval(testRunPolling, 30000);



      $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed too
        $interval.cancel(polling);
      });


    }
  }
}());
