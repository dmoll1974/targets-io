'use strict';

angular.module('testruns').directive('editTestrun', EditTestrunDirective);

function EditTestrunDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/edit-testrun.client.view.html',
    controller: EditTestrunDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditTestrunDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams) {


    $scope.openCalendar = openCalendar;
    $scope.update = update;
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

      $scope.testrun = TestRuns.selected;

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


    // Update Testrun
    function update() {
      TestRuns.update($scope.testrun).then(function (testrun) {

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
