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
  function ProductTestRunsDirectiveController ($scope, $state, $stateParams, $window, Templates, Dashboards, $filter, $rootScope, $interval, TestRuns, $mdToast) {


    $scope.updateNumberOfTestRuns = updateNumberOfTestRuns;
    $scope.openMenu = openMenu;
    $scope.go = go;
    $scope.editTestRun = editTestRun;
    $scope.viewTestRunSummary = viewTestRunSummary;
    $scope.testRunDetails = testRunDetails;


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


     
      getTestRuns()

    }


    function testRunDetails(testRun) {

      TestRuns.selected = testRun;

      Dashboards.get(testRun.productName,testRun.dashboardName).success(function(dashboard){

        $state.go('viewGraphs', {
          'productName': testRun.productName,
          'dashboardName': testRun.dashboardName,
          'testRunId': testRun.testRunId,
          tag: Dashboards.getDefaultTag(dashboard.tags)
        });

      })

    };


    function getTestRuns(){

      $scope.loadingTestRuns = true;

      TestRuns.listTestRunsForProduct($stateParams.productName,  $scope.loadNumberOfTestRuns ).success(function (testRuns) {

        $scope.loadingTestRuns = false;

        $scope.testRuns= [];
        $scope.testRuns= testRuns;
        $scope.numberOfTestRuns = testRuns.length;
        $scope.totalDuration = TestRuns.calculateTotalDuration(testRuns);


        var toast = $mdToast.simple()
            .action('OK')
            .highlightAction(true)
            .position('bottom center')
            .hideDelay(6000)



        $mdToast.show(toast.content('Number of displayed test runs: ' + $scope.numberOfTestRuns + '  Total duration: ' + $scope.totalDuration )).then(function (response) {

        });

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    }




    function updateNumberOfTestRuns(){

      $scope.loadingTestRuns = true;
      getTestRuns();

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
