'use strict';

angular.module('templates').directive('viewEvents', ViewEventsDirective);

function ViewEventsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/events/directives/view-events.client.view.html',
    controller: ViewEventsDirectiveController
  };

  return directive;

  /* @ngInject */
  function ViewEventsDirectiveController ($scope, $state, $stateParams, Events, $filter, $rootScope, Dashboards, ConfirmModal, $modal, $q) {


    $scope.editEvent = editEvent;
    $scope.openDeleteSelectedEventsModal = openDeleteSelectedEventsModal;
    $scope.setEventsSelected = setEventsSelected;
    $scope.setAllEventsSelected = setAllEventsSelected;
    $scope.addEventForDashboard = addEventForDashboard;

      /* watches */

    $scope.$watch('allEventsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.events, function (event, i) {
          event.selected = newVal;
        });
      }
    });

    /* activate */

    activate();

    /* functions */

    function activate() {

      Events.listEventsForDashboard($stateParams.productName, $stateParams.dashboardName).success(function (events) {
        Events.list = events;
        $scope.events = events;
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    }


    function setEventsSelected(eventSelected){

      if (eventSelected === false){

        $scope.eventSelected = false;

        _.each($scope.events, function(event){
          if(event.selected === true) $scope.eventSelected = true;
        })

      }else {
        $scope.eventSelected = eventSelected;
      }
    };

    function setAllEventsSelected(eventSelected){

      $scope.eventSelected = eventSelected;

    };

    // Open update event form
    function addEventForDashboard() {


      Events.selected = {};

      $state.go('createEvent', {
        productName: $stateParams.productName,
        dashboardName: $stateParams.dashboardName
      });
    };

    function editEvent(index) {
      Events.selected  = $scope.events[index];
      $state.go('editEvent', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'eventId':  Events.selected._id
      });
    };

    function openDeleteSelectedEventsModal(size) {

      var numberOfSelected = $scope.events.filter(function(event){
        if(event.selected === true)
          return event.selected === true;
      });

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = ' selected ' + numberOfSelected.length + ' events';
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
            $scope.eventSelected = false;
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

  }
}
