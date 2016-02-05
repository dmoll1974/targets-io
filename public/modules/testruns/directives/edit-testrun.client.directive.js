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

    $scope.testrun = TestRuns.selected;

    $scope.testRunIds = [];

    _.each(TestRuns.list, function(testRun){

      $scope.testRunIds.push(testRun.testRunId);

    });


    $scope.$watch('testrun.productName', function (val) {
      $scope.testrun.productName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('testrun.dashboardName', function (val) {
      $scope.testrun.dashboardName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('testrun.testRunId', function (val) {
      $scope.testrun.testRunId = $filter('uppercase')(val);
    }, true);

    $scope.isOpenStart = false;
    $scope.isOpenEnd = false;

    $scope.openCalendar = function (e, input) {
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
    $scope.update = function () {
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

    $scope.cancel = function () {
      /* reset form*/
      $scope.testrunForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

  }
}
