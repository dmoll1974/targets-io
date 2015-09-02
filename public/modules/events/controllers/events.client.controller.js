'use strict';

// Events controller
angular.module('events').controller('EventsController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', '$modal', 'Authentication', 'Events', 'Dashboards',
	function($scope, $rootScope, $stateParams, $state, $location, $modal, Authentication, Events, Dashboards) {


        $scope.productName = $stateParams.productName;


        $scope.event = Events.selected;



        $scope.initEventForm = function (){


            $scope.testRunIds = Events.getTestRunId(Events.list);
            $scope.descriptions = Events.getDescriptions(Events.list);

            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
        };

        // Open create event form
        $scope.addEventForDashboard = function () {


            $scope.event.eventTimestamp = new Date();
            $scope.event.productName = $stateParams.productName;
            $scope.event.dashboardName = $stateParams.dashboardName;
            $state.go('createEvent',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName});

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


        }


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
                "productName": $stateParams.productName,
                "dashboardName": $stateParams.dashboardName,
                "eventId": Events.selected._id
            });

        };

        //// Find existing Event
        //$scope.findOne = function () {
        //    $scope.event = Events.get({
        //        eventId: $stateParams.eventId
        //    });
        //};


        $scope.open = function (size, index) {

            Events.selected = $scope.events[index];

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'EventModalInstanceCtrl',
                size: size
            });

            modalInstance.result.then(function (eventId) {

                Events.delete(eventId).success(function (event) {

                    ///* refresh events*/
                    Events.listEventsForDashboard($scope.productName, $scope.dashboardName).success(function (events) {

                        $scope.events = events;

                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                });

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };

    }
]).controller('EventModalInstanceCtrl',['$scope','$modalInstance', 'Events', function($scope, $modalInstance, Events) {

    $scope.selectedEvent = Events.selected;

    $scope.ok = function () {
        $modalInstance.close($scope.selectedEvent._id);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}
]);
