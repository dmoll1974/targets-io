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

      $scope.openDeleteEventModal = function (size) {
        ConfirmModal.itemType = 'Delete event';
        ConfirmModal.selectedItemId = $scope.runningTest._id;
        ConfirmModal.selectedItemDescription = $scope.runningTest.eventDescription;
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: size  //,
        });
        modalInstance.result.then(function (eventId) {
          Events.delete(eventId).success(function (event) {
            //TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function (runningTest) {
            //
            //    $scope.runningTest = runningTest;
            $scope.showDialog = false;
            $state.go($state.current, {}, { reload: true });  //});
          });
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };
      $scope.openSendEndEventModal = function (size) {
        ConfirmModal.itemType = 'Send end event for test run ID ';
        ConfirmModal.selectedItemId = $scope.runningTest.testRunId;
        ConfirmModal.selectedItemDescription = $scope.runningTest.testRunId;
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: size  //,
        });
        modalInstance.result.then(function (eventId) {
          var endEvent = {
            productName: $scope.runningTest.productName,
            dashboardName: $scope.runningTest.dashboardName,
            testRunId: $scope.runningTest.testRunId,
            eventDescription: 'end',
            baseline: $scope.runningTest.baseline,
            buildResultKey: $scope.runningTest.buildResultKey
          };

          Events.create(endEvent).success(function (event) {

            $scope.showDialog = false;

            if(Dashboards.selected.useInBenchmark) {
              TestRuns.list.unshift({
                productName: $scope.runningTest.productName,
                dashboardName: $scope.runningTest.dashboardName,
                testRunId: $scope.runningTest.testRunId,
                buildResultKey: $scope.runningTest.buildResultKey,
                meetsRequirement: 'pending',
                benchmarkResultFixedOK: 'pending',
                benchmarkResultPreviousOK: 'pending'
              });
            }
                $timeout(function(){

                  TestRuns.listTestRunsForDashboard(Dashboards.selected.productName, Dashboards.selected.name, Dashboards.selected.useInBenchmark).success(function (testRuns) {


                    TestRuns.list = testRuns;

                  }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                  });

            }, 3000);


            //$state.go($state.current, {}, { reload: true });  //});
          });
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };
    }
  }
}());
