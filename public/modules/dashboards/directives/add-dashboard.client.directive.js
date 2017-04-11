'use strict';

angular.module('dashboards' +
    '').directive('addDashboard', AddDashboardDirective);

function AddDashboardDirective () {

    var directive = {
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/add-dashboard.client.view.html',
        controller: AddDashboardDirectiveController
    };

    return directive;

    /* @ngInject */
    function AddDashboardDirectiveController ($scope, $rootScope, $state , $stateParams, Dashboards, Products, TestRuns, $timeout) {


        /* Watches */

        var converter = new showdown.Converter({extensions: ['targetblank']});

        $scope.$watch('dashboard.markDown', function (newVal, oldVal) {

            if (newVal !== undefined) {

                var markDownToHTML = converter.makeHtml(newVal);

                $timeout(function () {

                    document.getElementById('markdown').innerHTML = markDownToHTML;

                }, 100)
            }
        });

        $scope.create = create;
        $scope.cancel = cancel;

        /* activate */

        activate();

        /* functions */

        function activate() {

            $scope.triedToSubmit = false;

            $scope.dashboard = {};
            Dashboards.selected = {};

            $scope.productName = $stateParams.productName;


            setTimeout(function () {
                document.querySelector('#dashboardName').focus();
            }, 1);
        }

            // Create new Dashboard
        function create() {
            // Create new Dashboard object
            //var dashboard = {};
            //dashboard.name = this.name;
            //dashboard.description = this.description;
            //dashboard.useInBenchmark = this.useInBenchmark;
            Dashboards.create($scope.dashboard, $stateParams.productName).success(function (dashboard) {
                /* Refresh sidebar */

                Dashboards.selected = dashboard;

                Products.fetch().success(function (products) {

                    Products.items = products;

                    $scope.products = products;



                    /* reset Test runs*/
                    TestRuns.list = [];

                    $state.go('viewDashboard', {
                        productName: $stateParams.productName,
                        dashboardName: Dashboards.selected.name
                    });

                    $scope.dashboardForm.$setPristine();  //

                });
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
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

