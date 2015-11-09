'use strict';
// Events controller
angular.module('events').controller('EventsController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$state',
  '$location',
  '$modal',
  'Authentication',
  'Events',
  'Dashboards',
  'ConfirmModal',
  function ($scope, $rootScope, $stateParams, $state, $location, $modal, Authentication, Events, Dashboards, ConfirmModal) {


    $scope.$watch('allEventsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.events, function (event, i) {
          event.selected = newVal;
        });
      }
    });

    $scope.setEventsSelected = function(eventSelected){

      if (eventSelected === false){

        $scope.eventSelected = false;

        _.each($scope.events, function(event){
          if(event.selected === true) $scope.eventSelected = true;
        })

      }else {
        $scope.eventSelected = eventSelected;
      }
    };

    $scope.setAllEventsSelected = function(eventSelected){

      $scope.eventSelected = eventSelected;
    };

    $scope.isOpen = false;
    $scope.openCalendar = function (e) {
      e.preventDefault();
      e.stopPropagation();
      $scope.isOpen = true;
    };
    $scope.productName = $stateParams.productName;
    $scope.event = Events.selected;
    $scope.initEventForm = function () {
      $scope.testRunIds = Events.getTestRunId(Events.list);
      $scope.descriptions = Events.getDescriptions(Events.list);  //$scope.dateOptions = {
                                                                  //    startingDay: 1,
                                                                  //    showWeeks: false
                                                                  //};
    };
    // Open update event form
    $scope.addEventForDashboard = function () {
      $scope.event.eventTimestamp = new Date();
      $scope.event.productName = $stateParams.productName;
      $scope.event.dashboardName = $stateParams.dashboardName;
      $state.go('createEvent', {
        productName: $stateParams.productName,
        dashboardName: $stateParams.dashboardName
      });
    };
    // Create new Event
    $scope.create = function () {
      Events.create($scope.event).then(function (event) {
        Events.selected = {};
        //$state.go('viewDashboard', {
        //    "productName": $scope.event.productName,
        //    "dashboardName": $scope.event.dashboardName
        //});
        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        $scope.eventForm.eventDescription.$setValidity('server', false);
      });
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
    $scope.listEventsForDashboard = function () {
      Events.listEventsForDashboard($scope.productName, $scope.dashboardName).success(function (events) {
        Events.list = events;
        $scope.events = events;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.editEvent = function (index) {
      Events.selected = $scope.events[index];
      $state.go('editEvent', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'eventId': Events.selected._id
      });
    };
    //// Find existing Event
    //$scope.findOne = function () {
    //    $scope.event = Events.get({
    //        eventId: $stateParams.eventId
    //    });
    //};

    $scope.openDeleteSelectedEventsModal = function (size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected events';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteEventArrayOfPromises = [];
        var i;
        for(i = $scope.events.length -1; i > -1; i--){

          if($scope.events[i].selected === true){
            deleteEventArrayOfPromises.push(Events.delete($scope.events[i]._id));
            $scope.events[i].selected = false;
            $scope.events.splice(i, 1);

          }
        }


        $q.all(deleteEventArrayOfPromises)
            .then(function (results) {
              Events.list = $scope.events;
            });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

    $scope.openDeleteEventModal = function (size, index) {

      ConfirmModal.itemType = 'Delete event ';
      Events.selected = $scope.events[index];
      ConfirmModal.selectedItemId = Events.selected._id;
      ConfirmModal.selectedItemDescription = Events.selected.eventDescription;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        Events.delete(Events.selected._id).success(function (event) {
          ///* refresh events*/
          $scope.events.splice(index,1);

        });
      }, function () {
      });
    };
  }
]).controller('EventModalInstanceCtrl', [
  '$scope',
  '$modalInstance',
  'Events',
  function ($scope, $modalInstance, Events) {
    $scope.selectedEvent = Events.selected;
    $scope.ok = function () {
      $modalInstance.close($scope.selectedEvent._id);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]);
