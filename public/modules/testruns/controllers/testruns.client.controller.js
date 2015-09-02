'use strict';

angular.module('testruns').controller('TestrunsController', ['$scope', '$stateParams', '$state', 'TestRuns', 'Dashboards', 'Events', '$modal', '$q', 'ConfirmModal',
	function($scope, $stateParams, $state, TestRuns, Dashboards, Events, $modal, $q, ConfirmModal) {


        $scope.productName = $stateParams.productName;

        $scope.dashboardName = $stateParams.dashboardName;


		/* List test runs for dashboard */


        $scope.listTestRunsForDashboard = function () {

            //var pending = false;
            //var intervalId = setInterval(function(){

                TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, false).success(function (testRuns){

                    //$scope.testRuns = result.testRuns;
                    ///* if all testruns have been persisted, stop polling */
                    //if (result.pending === false){
                    //    clearInterval(intervalId);
                    //}else{
                    //    pending = true;
                    //}

                    $scope.testRuns = testRuns;

                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });



            //}, 10000);

        };


        $scope.testRunDetails = function(index){

            TestRuns.selected = $scope.testRuns[index];
            $state.go('viewGraphs',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, "testRunId" : $scope.testRuns[index].testRunId, tag: Dashboards.getDefaultTag(Dashboards.selected.tags) });
        }

        $scope.testRunRequirements = function(index, status){

            TestRuns.selected = $scope.testRuns[index];

            switch (status){

                case null:

                    $scope.testRuns[index].testrunMeetsRequirement = "pending";

                    TestRuns.persistTestRunByIdFromEvents($stateParams.productName,$stateParams.dashboardName, $scope.testRuns[index].testRunId).success(function (testRun){

                        $scope.testRuns[index] = testRun;

                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                    break;

                default:

                    var requirementsResult = $scope.testRuns[index].testrunMeetsRequirement ? "passed" : "failed";

                    $state.go('requirementsTestRun',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, "testRunId" : $scope.testRuns[index].testRunId, "requirementsResult" : requirementsResult });

            }

        }



        $scope.openDeleteTestRunModal = function (size, index) {


            ConfirmModal.itemType = 'Delete test run ';
            ConfirmModal.selectedItemId = index;
            ConfirmModal.selectedItemDescription = $scope.testRuns[index].testRunId;

            var modalInstance = $modal.open({
                templateUrl: 'ConfirmDelete.html',
                controller: 'ModalInstanceController',
                size: size//,
            });

            modalInstance.result.then(function (selectedIndex) {

            $q.all([Events.delete($scope.testRuns[selectedIndex].eventIds[0]), Events.delete($scope.testRuns[selectedIndex].eventIds[1])])
                .then(TestRuns.delete($scope.productName, $scope.dashboardName, $scope.testRuns[selectedIndex].testRunId))
                .then(function(results){

                    /* refresh test runs*/
                    TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName).success(function (testRuns){

                        $scope.testRuns = testRuns;

                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });


                })

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });



        };

    }
]);
