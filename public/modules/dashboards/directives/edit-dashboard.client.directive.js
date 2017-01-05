'use strict';

angular.module('dashboards' +
    '').directive('editDashboard', EditDashboardDirective);

function EditDashboardDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/edit-dashboard.client.view.html',
        controller: EditDashboardDirectiveController
    };

    return directive;

    /* @ngInject */
    function EditDashboardDirectiveController ($scope, $rootScope, $state , $stateParams, Dashboards, Products, TestRuns, Events) {

        $scope.update = update;
        $scope.cancel = cancel;

        /* activate */

        activate();

        /* functions */

        function activate() {

            $scope.dashboard = Dashboards.selected;
            $scope.productName = $stateParams.productName;
            $scope.triedToSubmit = false;



        }

            // update Dashboard
        function update () {
            Dashboards.update($scope.dashboard).success(function (dashboard) {

                Dashboards.selected = dashboard;

                TestRuns.updateAllTestRunsForDashboard($state.params.productName, $state.params.dashboardName, dashboard.name).success(function(testruns) {

                    TestRuns.list = testruns;

                    Events.updateAllEventsForDashboard($state.params.productName, $state.params.dashboardName, dashboard.name).success(function (events) {

                        Events.list = events;


                        ///* Refresh header */
                        Products.fetch().success(function (products) {
                            Products.items = products;
                            $scope.products = products;

                            if ($rootScope.previousStateParams)
                                $state.go($rootScope.previousState, $rootScope.previousStateParams);
                            else
                                $state.go($rootScope.previousState);
                        });

                    });
                });
            });
        };

        function cancel() {
            /* reset form*/
            $scope.dashboardForm.$setPristine();
            if ($rootScope.previousStateParams)
                $state.go($rootScope.previousState, $rootScope.previousStateParams);
            else
                $state.go($rootScope.previousState);
        };



    }
}

