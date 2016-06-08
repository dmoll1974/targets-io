'use strict';

angular.module('testruns').directive('testruns', TestrunsDirective);

function TestrunsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/testruns.client.view.html',
    controller: TestrunsDirectiveController,
    controllerAs: 'vm'

  };

  return directive;

  /* @ngInject */
  function TestrunsDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics, TestRunSummary, $mdToast, $modal, ConfirmModal, $interval, $timeout, $window, mySocket) {


    var vm = this;

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;

    /* spinner stuff */

    var j = 0, counter = 0;
    var spinner;
    vm.modes = [];
    vm.determinateValue = 30;


    /* By default, show completed test runs only */
    vm.completedTestRunsOnly = true;


    vm.loadNumberOfTestRuns = 10;

    vm.numberOfRowOptions = [
      {value: 10},
      {value: 25},
      {value: 50},
      {value: 75},
      {value: 100}
    ];


    vm.showAnnotations = showAnnotations;
    vm.updateNumberOfTestRuns = updateNumberOfTestRuns;
    vm.editTestRun = editTestRun;
    vm.markAsComplete = markAsComplete;
    vm.setTestRunsSelected = setTestRunsSelected;
    vm.setAllTestRunsSelected = setAllTestRunsSelected;
    vm.refreshTestrun = refreshTestrun;
    vm.openDeleteSelectedTestRunsModal = openDeleteSelectedTestRunsModal;
    vm.setTestRunAsBaseline = setTestRunAsBaseline;
    vm.testRunRequirements = testRunRequirements;
    vm.testRunPreviousBuildBenchmark = testRunPreviousBuildBenchmark;
    vm.testRunFixedBaselineBenchmark = testRunFixedBaselineBenchmark;
    vm.liveGraphs = liveGraphs;
    vm.viewTestRunSummary = viewTestRunSummary;
    vm.testRunDetails = testRunDetails;
    vm.go = go;
    vm.openMenu = openMenu;


      /* watches */

    $scope.$watch('vm.loading', function (current, old) {
      if (current !== old) {
        if (current === true) {
          // Iterate every 100ms, non-stop
          spinner = $interval(function () {
            // Increment the Determinate loader
            vm.determinateValue += 1;
            if (vm.determinateValue > 100) {
              vm.determinateValue = 30;
            }
            // Incrementally start animation the five (5) Indeterminate,
            // themed progress circular bars
            if (j < 5 && !vm.modes[j] && vm.loading) {
              vm.modes[j] = 'indeterminate';
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

    ///* Watch on dashboard */
    //$scope.$watch(function (scope) {
    //  return Testruns.list;
    //}, function (newVal, oldVal) {
    //  $scope.dashboard = Dashboards.selected;
    //  SideMenu.productFilter = $stateParams.productName;
    //
    //});

    $scope.$watch('vm.allTestRunsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each(vm.testRuns, function (testRun, i) {
          testRun.selected = newVal;
        });
      }
    });

    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(spinner);
      $interval.cancel(Utils.polling);

    });


  /*socket.io*/

    mySocket.on('connect', function(data) {
      //mySocket.emit('join', 'Hello World from client');
      console.log('Joined: ' + data);
    });

    mySocket.on('message', function(data) {
      console.log('event:' + data.event);
      console.log('testrun:' + data.testrun.testRunId);
    });

    /* initialise */
    activate();


    function activate() {



        /* only get test runs from db when neccessary */
      /* if switching dashboards, reset application state */
      if(($rootScope.currentStateParams.dashboardName !== $rootScope.previousStateParams.dashboardName && $rootScope.previousStateParams.dashboardName) || !$rootScope.previousStateParams.dashboardName) {
      //if (TestRuns.list.length > 0) {


          vm.loading = true;
          return testRunPolling();


        } else {

          vm.testRuns = [];
          vm.testRuns.push(TestRuns.list);
          _.each(TestRuns.list, function(testRun){

              vm.testRuns.push(testRun);

          });
        vm.runningTest = (TestRuns.runningTest) ? TestRuns.runningTest : false;
        vm.numberOfRunningTests = (TestRuns.runningTest) ? TestRuns.runningTest : 0;

        }
      //}, 1);


      /* Check if baseline test run exists */

      Dashboards.get(vm.productName, vm.dashboardName).success(function (dashboard) {

        if (dashboard.useInBenchmark) {

          TestRuns.getTestRunById(vm.productName, vm.dashboardName, dashboard.baseline).error(function (data, status, header, config) {

            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top')
                .hideDelay(30000)
                .parent(angular.element('#fixedBaselineToast'))
                .theme('error-toast');

            $mdToast.show(toast.content('No fixed baseline set!')).then(function (response) {

            });

          });

        }
      });

      /* initialise polling */
      Utils.polling = $interval(testRunPolling, 15000);
    }

    /* refresh test runs every 15 seconds */


     function testRunPolling() {


       return TestRuns.listTestRunsForDashboard(vm.productName, vm.dashboardName, vm.loadNumberOfTestRuns).success(function (response) {

        vm.runningTest = response.runningTest;

        vm.numberOfRunningTests = response.numberOfRunningTests;

        vm.totalNumberOftestRuns = response.totalNumberOftestRuns;

        if(vm.testRuns > 0) {
          /* get testRun Id's that might be selected */
          var selectedTestRunIds = getSelectedTestRunIds(vm.testRuns);
        }

          /* reset test runs */
          vm.testRuns = [];



            _.each(response.testRuns, function(testRun){

              vm.testRuns.push(testRun);

            });


            /* set selected testruns if necessary */
            if (selectedTestRunIds > 0) {

              _.each(vm.testRuns, function (testRun) {

                _.each(selectedTestRunIds, function (selectedTestRunId) {

                  if (testRun.testRunId === selectedTestRunId) {

                    testRun.selected = true;
                  }
                });

              });
            }

            /* Set end value to 'Running' for running test(s)*/

            for (var i = 0; i < vm.numberOfRunningTests; i++) {

              vm.testRuns[i].end = 'Running ...';
            }

            vm.loading = false;
            return vm.testRuns;


        TestRuns.list = response.testRuns;
        TestRuns.runningTest = response.runningTest;
        TestRuns.numberOfRunningTests = response.numberOfRunningTests;



      });

    };


    /* get testRun Id's that might be selected */
    function getSelectedTestRunIds(testRuns){
      var selectedTestRunIds = [];
      var testRunsSelected = false;

      _.each(testRuns, function (testRun) {

          if (testRun.selected === true) {

            selectedTestRunIds.push(testRun.testRunId);
            testRunsSelected = true;
          }

        });

      return selectedTestRunIds;

    }


    var originatorEv;
    function openMenu($mdOpenMenu, ev) {
      $interval.cancel(Utils.polling);
      originatorEv = ev;
      $mdOpenMenu(ev);

    };


    function go(url) {
      //$window.location.href = url;
      $window.open(url, '_blank');
    };


    function testRunDetails(testRun) {
      TestRuns.selected = testRun;
      $state.go('viewGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    };

    function viewTestRunSummary(testRun){


      $state.go('testRunSummary', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId
      });

    }


    function liveGraphs(testRun){

      $state.go('viewLiveGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    }


    function testRunFixedBaselineBenchmark(testRun) {
      TestRuns.selected = testRun;
      var benchmarkFixedResult = testRun.benchmarkResultFixedOK ? 'passed' : 'failed';
      $state.go('benchmarkFixedBaselineTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'benchmarkResult': benchmarkFixedResult
      });
    };

    function testRunPreviousBuildBenchmark (testRun) {
      TestRuns.selected = testRun;
      var benchmarkPreviousResult = testRun.benchmarkResultPreviousOK ? 'passed' : 'failed';
      $state.go('benchmarkPreviousBuildTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'benchmarkResult': benchmarkPreviousResult
      });
    };

    function testRunRequirements(testRun) {
      TestRuns.selected = testRun;
      var requirementsResult = testRun.meetsRequirement ? 'passed' : 'failed';
      $state.go('requirementsTestRun', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRun.testRunId,
        'requirementsResult': requirementsResult
      });
    };

    function setTestRunAsBaseline(baseline) {
      var arrayOfPromises = [];
      Dashboards.selected.baseline = baseline;
      Dashboards.update(Dashboards.selected).success(function (dashboard) {
        Dashboards.selected = dashboard;
        vm.dashboard = dashboard;
        var baselineSet = false;
        _.each(vm.testRuns, function (testRun, index) {
          /* Only update test runs more recent than baseline */
          if (testRun.testRunId === baseline)
            baselineSet = true;
          if (testRun.testRunId !== baseline && baselineSet == false) {
            vm.testRuns[index].benchmarkResultFixedOK = 'pending';
            testRun.baseline = baseline;
            arrayOfPromises.push(TestRuns.updateFixedBaseline(testRun).then(function (testRun) {
            }));
          }
        });
        $q.all(arrayOfPromises).then(function (results) {
          /* refresh test runs*/
          setTimeout(function () {
            TestRuns.listTestRunsForDashboard(vm.productName, vm.dashboardName).success(function (testRuns) {
              TestRuns.list = testRuns;
            }, function (errorResponse) {
              vm.error = errorResponse.data.message;
            });
          }, 100);
        });
      });
    };

    function openDeleteSelectedTestRunsModal(size) {
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
        for (i = vm.testRuns.length - 1; i > -1; i--) {

          if (vm.testRuns[i].selected === true) {
            deleteTestRunsArrayOfPromises.push(TestRuns.delete(vm.productName, vm.dashboardName, vm.testRuns[i].testRunId));
            vm.testRunSelected = false;
            vm.testRuns[i].selected = false;
            vm.testRuns.splice(i, 1);
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

    function refreshTestrun(testRun) {

      /* stop polling during refresh */

      $interval.cancel(Utils.polling);


      var selectedTestRunIndex = vm.testRuns.map(function(currentTestRun) { return currentTestRun._id.toString(); }).indexOf(testRun._id.toString());

      vm.testRuns[selectedTestRunIndex].meetsRequirement = 'pending';
      vm.testRuns[selectedTestRunIndex].benchmarkResultPreviousOK = 'pending';
      vm.testRuns[selectedTestRunIndex].benchmarkResultFixedOK = 'pending';
      vm.testRuns[selectedTestRunIndex].busy = true;
      TestRuns.refreshTestrun($stateParams.productName, $stateParams.dashboardName, vm.testRuns[selectedTestRunIndex].testRunId).success(function (testRun) {
        vm.testRuns[selectedTestRunIndex] = testRun;
        vm.testRuns[selectedTestRunIndex].busy = false;

        /* start polling again after refresh */

        Utils.polling = $interval(testRunPolling, 15000);

      }, function (errorResponse) {
        vm.error = errorResponse.data.message;
      });
    };

    function setAllTestRunsSelected(testRunSelected){

      vm.testRunSelected = testRunSelected;
    };


    function setTestRunsSelected(testRunSelected){

      if (testRunSelected === false){

        vm.testRunSelected = false;

        _.each(vm.testRuns, function(testRun){
          if(testRun.selected === true) vm.testRunSelected = true;
        })

      }else {
        vm.testRunSelected = testRunSelected;
      }
    };

    function markAsComplete(testRun){

      testRun.completed = true;
      TestRuns.update(testRun).success(function(updatedTestRun){

        if(updatedTestRun){
          var updatedTestRunIndex = vm.testRuns.map(function(currentTestRun) { return currentTestRun._id.toString(); }).indexOf(updatedTestRun._id.toString());
          vm.testRuns[updatedTestRunIndex] = updatedTestRun;
          vm.completedTestRunsOnly = true;

          vm.testRuns[updatedTestRunIndex].meetsRequirement = 'pending';
          vm.testRuns[updatedTestRunIndex].benchmarkResultPreviousOK = 'pending';
          vm.testRuns[updatedTestRunIndex].benchmarkResultFixedOK = 'pending';
          vm.testRuns[updatedTestRunIndex].busy = true;

          TestRuns.refreshTestrun($stateParams.productName, $stateParams.dashboardName, vm.testRuns[updatedTestRunIndex].testRunId).success(function (testRun) {
            vm.testRuns[updatedTestRunIndex] = testRun;
            vm.testRuns[updatedTestRunIndex].busy = false;  ///* refresh screen*/
            //setTimeout(function(){
            //    $state.go($state.current, {}, {reload: true});
            //},1);
          }, function (errorResponse) {
            vm.error = errorResponse.data.message;
          });
        };

      });
    }


    function editTestRun (testRun){

      TestRuns.selected = testRun;
      $state.go('editTestRun',{productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId});

    }


    function updateNumberOfTestRuns() {

      vm.loading = true;

      testRunPolling();

    }


    function showAnnotations($event, testRun) {

      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        template: '<md-dialog aria-label="Annotations">' +
        '<md-toolbar class="md-padding"><h4>Test run annotations</h4></md-toolbar>' +
        '  <div layout="column"' +
        '  <md-dialog-content class="md-padding">' +
        '    <h5><em>{{testRun.testRunId}}</em></h5>' +
        '    <md-input-container class="md-block" flex>' +
        '       <textarea name="testrunAnnotations" ng-model="testRun.annotations" columns="1" md-maxlength="500" rows="10"></textarea>' +
        '    </md-input-container>' +
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
      function DialogController(vm, $mdDialog, testRun, TestRuns) {
        testRun = testRun;
        $scope.closeDialog = function () {
          TestRuns.update(testRun).success(function () {

            $mdDialog.hide();
          })

        }
      }

    }

  }
}
