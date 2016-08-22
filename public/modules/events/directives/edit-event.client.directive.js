'use strict';

angular.module('templates').directive('editEvent', EditEventDirective);

function EditEventDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/events/directives/edit-event.client.view.html',
    controller: EditEventDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditEventDirectiveController ($scope, $state, Events, $filter, $rootScope, TestRuns) {

    $scope.event = Events.selected;

    $scope.testRunIds = Events.getTestRunId(TestRuns.list);
    $scope.descriptions = Events.getDescriptions(Events.list);


    $scope.$watch('event.productName', function (val) {
      $scope.event.productName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('event.dashboardName', function (val) {
      $scope.event.dashboardName = $filter('uppercase')(val);
    }, true);

    $scope.isOpen = false;
    $scope.openCalendar = function (e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.isOpen = true;
    };


    // Update Event
    $scope.update = function () {
      Events.update(Events.selected).then(function (event) {
        Events.selected = {};
        /* reset form*/
        $scope.eventForm.$setPristine();
        /* return to previous state */
        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        $scope.eventForm.eventDescription.$setValidity('server', false);
      });
    };
    $scope.cancel = function () {
      Events.selected = {};
      /* reset form*/
      $scope.eventForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

  }
}
