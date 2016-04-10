'use strict';

angular.module('products').directive('productTestruns', ProductTestRunsDirective);

function ProductTestRunsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-testruns.client.view.html',
    controller: ProductTestRunsDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductTestRunsDirectiveController ($scope, $state, $stateParams, $window, Templates, Dashboards, $filter, $rootScope, $interval, TestRuns) {

    /* By default, show completed test runs only */
    $scope.completedTestRunsOnly = true;
    $scope.loadNumberOfTestRuns = 10;

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

    testRunPolling();
    var polling = $interval(testRunPolling, 30000);


    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(polling);

    });

    $scope.updateNumberOfTestRuns = function(){

      $scope.loadingTestRuns = true;
      testRunPolling();

    }

    $scope.numberOfRowOptions = [
      {value: 10},
      {value: 25},
      {value: 50},
      {value: 75},
      {value: 100}
    ];


    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.go = function (url) {
      //$window.location.href = url;
      $window.open(url, '_blank');
    };


    $scope.editTestRun = function (testRun){

      TestRuns.selected = testRun;
      $state.go('editTestRun',{productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId});

    }

    $scope.viewTestRunSummary = function(testRun){


      $state.go('testRunSummary', {
        'productName': testRun.productName,
        'dashboardName': testRun.dashboardName,
        'testRunId': testRun.testRunId
      });

    }



  }
}
