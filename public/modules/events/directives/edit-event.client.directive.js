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


    $scope.openCalendar = openCalendar;
    $scope.update = update;
    $scope.cancel = cancel;

      /* watches */

    $scope.$watch('event.productName', function (val) {
      $scope.event.productName = $filter('uppercase')(val);
    }, true);

    $scope.$watch('event.dashboardName', function (val) {
      $scope.event.dashboardName = $filter('uppercase')(val);
    }, true);

    /* activate */

    activate();

    /* functions */

    function activate() {

      $scope.event = Events.selected;
      $scope.testRunIds = Events.getTestRunId(TestRuns.list);
      $scope.descriptions = Events.getDescriptions(Events.list);
      $scope.isOpen = false;
      $scope.triedToSubmit = false;


    }

    function openCalendar(e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.isOpen = true;
    };


    // Update Event
    function update() {
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

    function cancel() {
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
