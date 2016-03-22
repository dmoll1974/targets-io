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
  '$mdDialog',
  'Utils',
  function ($scope, $stateParams, $state, TestRuns, Dashboards, Events, $modal, $q, ConfirmModal, $window, $interval, $mdDialog, Utils) {

    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;

    /* By default, show completed test runs only */
    $scope.completedTestRunsOnly = true;


    $scope.loadNumberOfTestRuns = 10;

    $scope.numberOfRowOptions = [
      {value: 10},
      {value: 25},
      {value: 50},
      {value: 75},
      {value: 100}
    ];



    $scope.showAnnotations = function ($event, testRun) {

      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        template:
        '<md-dialog aria-label="Annotations">' +
        '<md-toolbar class="md-padding"><h4>Test run annotations</h4></md-toolbar>' +
        '  <div layout="column"' +
        '  <md-dialog-content class="md-padding">'+
        '    <h5><em>{{testRun.testRunId}}</em></h5>' +
        '    <md-input-container class="md-block" flex>'+
        '       <textarea name="testrunAnnotations" ng-model="testRun.annotations" columns="1" md-maxlength="500" rows="10"></textarea>'+
        '    </md-input-container>'+
        '  </md-dialog-content>' +
        '  <md-dialog-actions>' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      OK' +
        '    </md-button>' +
        '  </md-dialog-actions>' +
        '  </div>' +
        '</md-dialog>',
        locals: {
          testRun: testRun
        },
        controller: DialogController
      });
      function DialogController($scope, $mdDialog, testRun, TestRuns) {
        $scope.testRun = testRun;
        $scope.closeDialog = function() {
          TestRuns.update($scope.testRun).success(function(){

            $mdDialog.hide();
          })

        }
      }

      //var alert = $mdDialog.alert()
      //    .title('Test run annotations')
      //    .content(annotation)
      //    .ok('Close')
      //    .templateUrl('modules/testruns/views/annotations-dialog.client.view.html');
      //
      //$mdDialog
      //    .show( alert )
      //    .finally(function() {
      //      alert = undefined;
      //    });

    };

    $scope.updateNumberOfTestRuns = function(){

      $scope.loading = true;

      testRunPolling();

    }

    /* refresh test runs every 15 seconds */


    var testRunPolling = function () {
      TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, $scope.loadNumberOfTestRuns).success(function (response) {

        $scope.runningTest = response.runningTest;

        $scope.numberOfRunningTests = response.numberOfRunningTests;

        $scope.totalNumberOftestRuns = response.totalNumberOftestRuns



        /* get testRun Id's that might be selected */
        var selectedTestRunIds = [];
        var testRunsSelected = false;

        _.each($scope.testRuns, function(testRun){

          if(testRun.selected === true){

            selectedTestRunIds.push(testRun.testRunId);
            testRunsSelected = true;
          }

        });

        $scope.testRuns = [];

        $scope.testRuns = response.testRuns;

        /* set selected testruns if necessary */
        if (testRunsSelected === true){

          _.each($scope.testRuns, function(testRun){

              _.each(selectedTestRunIds, function(selectedTestRunId){

                  if(testRun.testRunId === selectedTestRunId ){

                    testRun.selected = true;
                    return;
                  }
              });

          });
        }
        /* Set end value to 'Running' for running test(s)*/

        for (var i = 0; i < $scope.numberOfRunningTests; i++) {

          $scope.testRuns[i].end = 'Running ...';
        }

        $scope.loading = false;

        TestRuns.list = response.testRuns;
        TestRuns.runningTest = response.runningTest;
        TestRuns.numberOfRunningTests = response.numberOfRunningTests;


      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };

    var polling = $interval(testRunPolling, 15000);

    setTimeout(function(){
      /* only get test runs from db when neccessary */
      if (TestRuns.list.length > 0) {

        $scope.testRuns = TestRuns.list;
        $scope.runningTest = (TestRuns.runningTest) ?  TestRuns.runningTest : false;
        $scope.numberOfRunningTests = (TestRuns.runningTest) ? TestRuns.runningTest : 0;


        } else {

        $scope.loading = true;

        testRunPolling();

      }
    }, 1);

    $scope.editTestRun = function (testRun){

      TestRuns.selected = testRun;
      $state.go('editTestRun',{productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId});

    }

    $scope.markAsComplete = function(testRun){

      testRun.completed = true;
      TestRuns.update(testRun).success(function(updatedTestRun){

         if(updatedTestRun){
           var updatedTestRunIndex = $scope.testRuns.map(function(currentTestRun) { return currentTestRun._id.toString(); }).indexOf(updatedTestRun._id.toString());
           $scope.testRuns[updatedTestRunIndex] = updatedTestRun;
           $scope.completedTestRunsOnly = true;

           $scope.testRuns[updatedTestRunIndex].meetsRequirement = 'pending';
           $scope.testRuns[updatedTestRunIndex].benchmarkResultPreviousOK = 'pending';
           $scope.testRuns[updatedTestRunIndex].benchmarkResultFixedOK = 'pending';
           $scope.testRuns[updatedTestRunIndex].busy = true;

           TestRuns.refreshTestrun($stateParams.productName, $stateParams.dashboardName, $scope.testRuns[updatedTestRunIndex].testRunId).success(function (testRun) {
             $scope.testRuns[updatedTestRunIndex] = testRun;
             $scope.testRuns[updatedTestRunIndex].busy = false;  ///* refresh screen*/
                                                   //setTimeout(function(){
                                                   //    $state.go($state.current, {}, {reload: true});
                                                   //},1);
           }, function (errorResponse) {
             $scope.error = errorResponse.data.message;
           });
         };

      });
    }

    $scope.$watch('allTestRunsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.testRuns, function (testRun, i) {
          testRun.selected = newVal;
        });
      }
    });

    $scope.setTestRunsSelected = function(testRunSelected){

      if (testRunSelected === false){

        $scope.testRunSelected = false;

        _.each($scope.testRuns, function(testRun){
          if(testRun.selected === true) $scope.testRunSelected = true;
        })

      }else {
        $scope.testRunSelected = testRunSelected;
      }
    };

    $scope.setAllTestRunsSelected = function(testRunSelected){

      $scope.testRunSelected = testRunSelected;
    };

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
            //console.log('bla');
          }, 100, 0, true);
        }else{

          $interval.cancel(spinner);

        }
      }
    });
    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(spinner);
      $interval.cancel(polling);

    });
    
    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.go = function (url) {
      //$window.location.href = url;
      $window.open(url, '_blank');
    };

    //$scope.$watch(function (scope) {
    //  return Dashboards.selected._id;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
    //    $scope.dashboard = Dashboards.selected;
    //
    //  }
    //});
    //$scope.$watch(function (scope) {
    //  return TestRuns.list;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    $scope.testRuns = [];
    //    $scope.testRuns = TestRuns.list;
    //  }
    //});
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
    $scope.testRunDetails = function (testRun) {
      TestRuns.selected = testRun;
      $state.go('viewGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    };

    $scope.viewTestRunSummary = function(testRun){


      $state.go('testRunSummary', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId
      });

    }

    $scope.liveGraphs = function(testRun){

      $state.go('viewLiveGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    }

    $scope.testRunFixedBaselineBenchmark = function (testRun) {
      TestRuns.selected = testRun;
      var benchmarkFixedResult = testRun.benchmarkResultFixedOK ? 'passed' : 'failed';
      $state.go('benchmarkFixedBaselineTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'benchmarkResult': benchmarkFixedResult
      });
    };
    $scope.testRunPreviousBuildBenchmark = function (testRun) {
      TestRuns.selected = testRun;
      var benchmarkPreviousResult = testRun.benchmarkResultPreviousOK ? 'passed' : 'failed';
      $state.go('benchmarkPreviousBuildTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'benchmarkResult': benchmarkPreviousResult
      });
    };
    $scope.testRunRequirements = function (testRun) {
      TestRuns.selected = testRun;
      var requirementsResult = testRun.meetsRequirement ? 'passed' : 'failed';
      $state.go('requirementsTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'requirementsResult': requirementsResult
      });
    };
    $scope.setTestRunAsBaseline = function (baseline) {
      var arrayOfPromises = [];
      Dashboards.selected.baseline = baseline;
      Dashboards.update(Dashboards.selected).success(function (dashboard) {
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
            TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName).success(function (testRuns) {
              TestRuns.list = testRuns;
            }, function (errorResponse) {
              $scope.error = errorResponse.data.message;
            });
          }, 100);
        });
      });
    };
    $scope.refreshTestrun = function (testRun) {

      var selectedTestRunIndex = $scope.testRuns.map(function(currentTestRun) { return currentTestRun._id.toString(); }).indexOf(testRun._id.toString());

      $scope.testRuns[selectedTestRunIndex].meetsRequirement = 'pending';
      $scope.testRuns[selectedTestRunIndex].benchmarkResultPreviousOK = 'pending';
      $scope.testRuns[selectedTestRunIndex].benchmarkResultFixedOK = 'pending';
      $scope.testRuns[selectedTestRunIndex].busy = true;
      TestRuns.refreshTestrun($stateParams.productName, $stateParams.dashboardName, $scope.testRuns[selectedTestRunIndex].testRunId).success(function (testRun) {
        $scope.testRuns[selectedTestRunIndex] = testRun;
        $scope.testRuns[selectedTestRunIndex].busy = false;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.openDeleteSelectedTestRunsModal = function (size) {
      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemDescription = ' selected test runs';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function (selectedIndex) {

        var deleteTestRunsArrayOfPromises = [];
        var i;
        for (i = $scope.testRuns.length - 1; i > -1; i--) {

          if ($scope.testRuns[i].selected === true) {
            deleteTestRunsArrayOfPromises.push(TestRuns.delete($scope.productName, $scope.dashboardName, $scope.testRuns[i].testRunId));
            $scope.testRunSelected = false;
            $scope.testRuns[i].selected = false;
            $scope.testRuns.splice(i, 1);
            if(TestRuns.list[i]) TestRuns.list.splice(i, 1);
          }

        }


        $q.all(deleteTestRunsArrayOfPromises)
        .then(function () {

          /* refresh view */

          testRunPolling();


        });

      }, function () {
      });
    };
  }
]);
