'use strict';

angular.module('products').directive('productTestruns', ProductTestRunsDirective);

function ProductTestRunsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-testruns/product-testruns.client.view.html',
    controller: ProductTestRunsDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductTestRunsDirectiveController ($scope, $state, $stateParams, $window, Templates, Dashboards, $filter, $rootScope, $interval, TestRuns) {


    $scope.updateNumberOfTestRuns = updateNumberOfTestRuns;
    $scope.openMenu = openMenu;
    $scope.go = go;
    $scope.editTestRun = editTestRun;
    $scope.viewTestRunSummary = viewTestRunSummary;

      /* Watches */

    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(polling);

    });

    /* activate */

    activate();

    /* functions */

    function activate() {

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


      testRunPolling();
      var polling = $interval(testRunPolling, 30000);

    }



    var testRunPolling = function(){

      $scope.loadingTestRuns = true;

      TestRuns.listTestRunsForProduct($stateParams.productName,  $scope.loadNumberOfTestRuns ).success(function (testRuns) {

        $scope.loadingTestRuns = false;

        $scope.testRuns= [];
        $scope.testRuns= testRuns;
        $scope.numberOfTestRuns = testRuns.length;
        $scope.totalDuration = TestRuns.calculateTotalDuration(testRuns);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };


    function updateNumberOfTestRuns(){

      $scope.loadingTestRuns = true;
      testRunPolling();

    }



    var originatorEv;

    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    function go(url) {
      //$window.location.href = url;
      $window.open(url, '_blank');
    };


    function editTestRun(testRun){

      TestRuns.selected = testRun;
      $state.go('editTestRun',{productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId});

    }

    function viewTestRunSummary(testRun){


      $state.go('testRunSummary', {
        'productName': testRun.productName,
        'dashboardName': testRun.dashboardName,
        'testRunId': testRun.testRunId
      });

    }



  }
}
