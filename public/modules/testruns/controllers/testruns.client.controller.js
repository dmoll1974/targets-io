'use strict';
angular.module('testruns').controller('TestrunsController', [
  '$scope',
  '$stateParams',
  '$state',
  'TestRuns',
  'Dashboards',
  'Events',
  '$modal',
  '$q',
  'ConfirmModal',
  '$window',
  '$interval',
  function ($scope, $stateParams, $state, TestRuns, Dashboards, Events, $modal, $q, ConfirmModal, $window, $interval) {

    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;
    $scope.loading = true;

    var j = 0, counter = 0;
    var spinner;
    $scope.modes = [];
    $scope.determinateValue = 30;
    $scope.$watch('loading', function (current, old) {
      if (current !== old) {
        if (current === true) {
          // Iterate every 100ms, non-stop
          spinner = $interval(function () {
            // Increment the Determinate loader
            $scope.determinateValue += 1;
            if ($scope.determinateValue > 100) {
              $scope.determinateValue = 30;
            }
            // Incrementally start animation the five (5) Indeterminate,
            // themed progress circular bars
            if (j < 5 && !$scope.modes[j] && $scope.loading) {
              $scope.modes[j] = 'indeterminate';
            }
            if (counter++ % 4 == 0)
              j++;
            console.log('bla');
          }, 100, 0, true);
        }else{

          $interval.cancel(spinner);

        }
      }
    });
    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(spinner);
    });
    
    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.go = function (url) {
      $window.location.href = url;
    };

    $scope.$watch(function (scope) {
      return Dashboards.selected._id;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
        $scope.dashboard = Dashboards.selected;
        $scope.loading = true;
        $scope.getTestRuns = TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, Dashboards.selected.useInBenchmark).success(function (testRuns) {
          TestRuns.list = testRuns;
          $scope.loading = false;
          $scope.testRuns = TestRuns.list;
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    });
    $scope.$watch(function (scope) {
      return TestRuns.list;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.testRuns = TestRuns.list;
      }
    });
    /* List test runs for dashboard */
    //        $scope.listTestRunsForDashboard = function() {
    //
    //            $scope.loading = true;
    //
    //            TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName).success(function (testRuns) {
    //
    //                TestRuns.list = testRuns;
    //                $scope.testRuns = TestRuns.list;
    //                $scope.loading = false;
    //
    //            }, function (errorResponse) {
    //                $scope.error = errorResponse.data.message;
    //            });
    //
    //
    //        };
    $scope.testRunDetails = function (index) {
      TestRuns.selected = $scope.testRuns[index];
      $state.go('viewGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': $scope.testRuns[index].testRunId,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    };
    $scope.testRunFixedBaselineBenchmark = function (index) {
      TestRuns.selected = $scope.testRuns[index];
      var benchmarkFixedResult = $scope.testRuns[index].benchmarkResultFixedOK ? 'passed' : 'failed';
      $state.go('benchmarkFixedBaselineTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': $scope.testRuns[index].testRunId,
        'benchmarkResult': benchmarkFixedResult
      });
    };
    $scope.testRunPreviousBuildBenchmark = function (index) {
      TestRuns.selected = $scope.testRuns[index];
      var benchmarkPreviousResult = $scope.testRuns[index].benchmarkResultPreviousOK ? 'passed' : 'failed';
      $state.go('benchmarkPreviousBuildTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': $scope.testRuns[index].testRunId,
        'benchmarkResult': benchmarkPreviousResult
      });
    };
    $scope.testRunRequirements = function (index) {
      TestRuns.selected = $scope.testRuns[index];
      var requirementsResult = $scope.testRuns[index].meetsRequirement ? 'passed' : 'failed';
      $state.go('requirementsTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': $scope.testRuns[index].testRunId,
        'requirementsResult': requirementsResult
      });
    };
    $scope.setTestRunAsBaseline = function (baseline) {
      var arrayOfPromises = [];
      Dashboards.selected.baseline = baseline;
      Dashboards.update().success(function (dashboard) {
        Dashboards.selected = dashboard;
        $scope.dashboard = dashboard;
        var baselineSet = false;
        _.each($scope.testRuns, function (testRun, index) {
          /* Only update test runs more recent than baseline */
          if (testRun.testRunId === baseline)
            baselineSet = true;
          if (testRun.testRunId !== baseline && baselineSet == false) {
            $scope.testRuns[index].benchmarkResultFixedOK = 'pending';
            testRun.baseline = baseline;
            arrayOfPromises.push(TestRuns.updateFixedBaseline(testRun).then(function (testRun) {
            }));  //.success(function (updatedTestRun) {
                  //                            $scope.testRuns[index] = updatedTestRun;
                  //                            $scope.testRuns[index].busy = false;
                  //
                  //
                  //                        }, function(errorResponse) {
                  //                            $scope.error = errorResponse.data.message;
                  //                        });
          }
        });
        $q.all(arrayOfPromises).then(function (results) {
          /* refresh test runs*/
          setTimeout(function () {
            TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, Dashboards.selected.useInBenchmark).success(function (testRuns) {
              TestRuns.list = testRuns;
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }, 100);
        });
      });
    };
    $scope.refreshTestrun = function (index) {
      $scope.testRuns[index].meetsRequirement = 'pending';
      $scope.testRuns[index].benchmarkResultPreviousOK = 'pending';
      $scope.testRuns[index].benchmarkResultFixedOK = 'pending';
      $scope.testRuns[index].busy = true;
      TestRuns.refreshTestrun($stateParams.productName, $stateParams.dashboardName, $scope.testRuns[index].testRunId).success(function (testRun) {
        $scope.testRuns[index] = testRun;
        $scope.testRuns[index].busy = false;  ///* refresh screen*/
                                              //setTimeout(function(){
                                              //    $state.go($state.current, {}, {reload: true});
                                              //},1);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.openDeleteTestRunModal = function (size, index) {
      ConfirmModal.itemType = 'Delete test run ';
      ConfirmModal.selectedItemId = index;
      ConfirmModal.selectedItemDescription = $scope.testRuns[index].testRunId;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function (selectedIndex) {
        $q.all([
          Events.delete($scope.testRuns[selectedIndex].eventIds[0]),
          Events.delete($scope.testRuns[selectedIndex].eventIds[1])
        ]).then(TestRuns.delete($scope.productName, $scope.dashboardName, $scope.testRuns[selectedIndex].testRunId)).then(function (results) {
          /* refresh test runs*/
          $scope.testRuns.splice(selectedIndex,1);
          //TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, Dashboards.selected.useInBenchmark).success(function (testRuns) {
          //  $scope.testRuns = testRuns;
          //}, function (errorResponse) {
          //  $scope.error = errorResponse.data.message;
          //});
        });
      }, function () {
      });
    };
  }
]);
