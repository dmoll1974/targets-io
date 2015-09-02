(function() {
    'use strict';

    /* public/modules/graphs/directives/gatling-details.client.directive.js */

    /**
     * @desc
     * @example <div gatling-details></div>
     */
    angular
        .module('graphs')
        .directive(
        'gatlingDetails', GatlingDetailsDirective)
        .directive(
        'loadingContainer', LoadingContainerDirective);

    function GatlingDetailsDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'modules/graphs/views/gatling-details.client.view.html',
            controller: GatlingDetailsController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function GatlingDetailsController (
            $scope,
            $timeout,
            $filter,
            $stateParams,
            GatlingConsoleDetails,
            TestRuns,
            ngTableParams

        ) {

            $scope.tabNumber = 0;

            $scope.setTab = function(newValue){
                $scope.tabNumber = newValue;
                $scope.tableParams.filter({});
                $scope.tableParams.reload();
            }

            $scope.isSet = function(tabNumber){
                return $scope.tabNumber  === tabNumber;
            };


            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

                TestRuns.selected = testRun;

                $scope.tableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 50,          // count per page
                    sorting: {
                        KO: 'desc',     // initial sorting
                        OK: 'desc',
                        numberOfErrors: 'desc'

                    }
                }, {
                    total: 0,           // length of data
                    getData: function($defer, params) {
                        // ajax request to api
                        GatlingConsoleDetails.getData(TestRuns.selected.buildResultKey, false).success(function(response) {

                            $timeout(function() {

                                var data = ($scope.tabNumber === 0) ? response.data : response.errors;

                                var filteredData = params.filter() ?
                                    $filter('filter')(data, params.filter()) :
                                    data;
                                var orderedData = params.sorting() ?
                                    $filter('orderBy')(filteredData, params.orderBy()) :
                                    filteredData;
                                // update table params
                                params.total(orderedData.length);
                                // set new data
                                $defer.resolve(orderedData);
                            }, 500);
                        });
                    }
                });
            });



        }
    }

    function LoadingContainerDirective (){

        var directive = {
            restrict: 'A',
            scope: false,
            link: function (scope, element, attrs) {
                var loadingLayer = angular.element('<div class="loading"></div>');
                element.append(loadingLayer);
                element.addClass('loading-container');
                scope.$watch(attrs.loadingContainer, function (value) {
                    loadingLayer.toggleClass('ng-hide', !value);
                });
            }
        };

        return directive;

    }
}());
