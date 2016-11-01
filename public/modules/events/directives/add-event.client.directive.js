'use strict';

angular.module('templates').directive('addEvent', AddEventDirective);

function AddEventDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/events/directives/add-event.client.view.html',
    controller: AddEventDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddEventDirectiveController ($scope, $state, Events, $filter, $rootScope, $stateParams, TestRuns) {

    $scope.openCalendar = openCalendar;
    $scope.create = create;
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
      $scope.event.eventTimestamp = Events.selected.eventTimestamp ? Events.selected.eventTimestamp : new Date();
      $scope.event.productName = $stateParams.productName;
      $scope.event.dashboardName = $stateParams.dashboardName;
      $scope.event.testRunId = Events.selected.testRunId ? Events.selected.testRunId : '';
      $scope.testRunIds = Events.getTestRunId(TestRuns.list);
      $scope.descriptions = Events.getDescriptions(Events.list);
      $scope.isOpen = false;

    }

    function openCalendar (e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.isOpen = true;
    };


    // Create new Event
    function create() {
      Events.create($scope.event).then(function (event) {
        Events.selected = {};

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
