'use strict';

angular.module('dashboards' +
    '').directive('viewDashboard', ViewDashboardDirective);

function ViewDashboardDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/view-dashboard.client.view.html',
        controller: ViewDashboardDirectiveController
    };

    return directive;

    /* @ngInject */
    function ViewDashboardDirectiveController ($scope, $rootScope, $state , $stateParams, Dashboards, Products, TestRuns) {

        $scope.setTab = setTab;

        /* Watches */

        /* Tab controller */

        $scope.$watch(function (scope) {
            return Dashboards.selectedTab;
        }, function () {
            $scope.selectedIndex = Dashboards.selectedTab;
        });

        /* activate */

        activate();

        /* functions */

        function activate() {

            if(Dashboards.selected !== {}) {

                $scope.dashboard = Dashboards.selected;
                $scope.showBenchmarks = Dashboards.selected.useInBenchmark;

                if (Dashboards.selected.productName !== $stateParams.productName || Dashboards.selected.name !== $stateParams.dashboardName) {

                    /* reset all test run related state */
                    TestRuns.list = [];
                    TestRuns.runningTest = '';
                    TestRuns.numberOfRunningTests = '';
                    //Utils.reset();
                    //Utils.zoomFrom = '';
                    //Utils.zoomUntil = '';

                    Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
                        $scope.dashboard = Dashboards.selected;
                        $scope.showBenchmarks = Dashboards.selected.useInBenchmark;


                    });
                }
            }else{
                if($stateParams.dashboardName) {
                    Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
                        $scope.dashboard = Dashboards.selected;
                        $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
                    });
                }
            }

            setTimeout(function () {
                document.querySelector('#dashboardName').focus();
            }, 1);
        }


        function setTab(newValue) {

            Dashboards.selectedTab = newValue;

        };



    }
}

