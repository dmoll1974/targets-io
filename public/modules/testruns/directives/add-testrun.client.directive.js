'use strict';

angular.module('testruns').directive('addTestrun', AddTestrunDirective);

function AddTestrunDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/add-testrun.client.view.html',
    controller: AddTestrunDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddTestrunDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, $mdToast) {


    $scope.openCalendar = openCalendar;
    $scope.create = create;
    $scope.cancel = cancel;

      /* Watches */

    $scope.$watch('testrun.productName', function (val) {
      $scope.testrun.productName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('testrun.dashboardName', function (val) {
      $scope.testrun.dashboardName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('testrun.testRunId', function (val) {
      $scope.testrun.testRunId = $filter('uppercase')(val);
    }, true);

    /* activate */

    activate();

    /* functions */

    function activate() {

      $scope.testrun = {};
      $scope.testrun.productName = $state.params.productName;
      $scope.testrun.dashboardName = $state.params.dashboardName;
      $scope.testRunIds = [];

      _.each(TestRuns.list, function (testRun) {

        $scope.testRunIds.push(testRun.testRunId);

      });

      $scope.isOpenStart = false;
      $scope.isOpenEnd = false;

    }



    function openCalendar(e, input) {
      e.preventDefault();
      e.stopPropagation();
      switch(input){
        case 'start':
          $scope.isOpenStart = true;
          break;
        case 'end':
          $scope.isOpenEnd = true;
          break;

      }
    };


    // Create new Testrun
    function create() {

        var toast = $mdToast.simple()
            .action('OK')
            .highlightAction(true)
            .position('bottom center')
            .parent(angular.element('#submit'))
            .hideDelay(6000);

        $mdToast.show(toast.content('Test run data is being collected ... (could take a while)')).then(function(response) {

        });

        TestRuns.addTestRun($scope.testrun).success(function (testrun) {

          TestRuns.list.unshift(testrun);

          if ($rootScope.previousStateParams)
            $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
            $state.go($rootScope.previousState);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
          $scope.testrunForm.testRunId.$setValidity('server', false);
        });
    };

    function cancel() {
      /* reset form*/
      $scope.testrunForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

  }
}
