(function() {
    'use strict';

    /* public/modules/testruns/directives/running-test.client.directive.js */

    /**
     * @desc
     * @example <div running-test></div>
     */
    angular
        .module('testruns')
        .directive(
        'runningTest', RunningTestDirective)

    function RunningTestDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'modules/testruns/views/running-test-directive.client.view.html',
            controller: RunningTestController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function RunningTestController (
            $scope,
            $modal,
            $stateParams,
            $state,
            TestRuns,
            Events,
            ConfirmModal
        ) {
    
            $scope.showDialog = false;

            TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function (runningTest) {

                if(Object.keys(runningTest).length !== 0){

                    $scope.runningTest = runningTest;
                    $scope.showDialog = true;

                }
                


            });

            $scope.openDeleteEventModal = function (size) {

                ConfirmModal.itemType = 'Delete event';
                ConfirmModal.selectedItemId = $scope.runningTest._id;
                ConfirmModal.selectedItemDescription = $scope.runningTest.eventDescription;

                var modalInstance = $modal.open({
                    templateUrl: 'ConfirmDelete.html',
                    controller: 'ModalInstanceController',
                    size: size//,
                });

                modalInstance.result.then(function (eventId) {

                    Events.delete(eventId).success(function(event){

                        //TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function (runningTest) {
                        //
                        //    $scope.runningTest = runningTest;
                        $scope.showDialog = false;
                        $state.go($state.current, {}, {reload: true});

                        //});

                    });

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.openSendEndEventModal = function (size) {

                ConfirmModal.itemType = 'Send end event for test run ID ';
                ConfirmModal.selectedItemId = $scope.runningTest.testRunId;
                ConfirmModal.selectedItemDescription = $scope.runningTest.testRunId;

                var modalInstance = $modal.open({
                    templateUrl: 'ConfirmDelete.html',
                    controller: 'ModalInstanceController',
                    size: size//,
                });

                modalInstance.result.then(function (eventId) {

                    var endEvent = {
                        productName: $scope.runningTest.productName,
                        dashboardName: $scope.runningTest.dashboardName,
                        testRunId: $scope.runningTest.testRunId,
                        eventDescription: 'end',
                        baseline: $scope.runningTest.baseline,
                        buildResultKey: $scope.runningTest.buildResultKey
                    };

                    Events.create(endEvent).success(function(event){

                        //TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function (runningTest) {
                        //
                        //    $scope.runningTest = runningTest;
                        $scope.showDialog = false;
                        $state.go($state.current, {}, {reload: true});

                        //});

                    });

                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

        }


    }

}());
