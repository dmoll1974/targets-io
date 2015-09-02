(function() {
    'use strict';

    /* public/modules/graphs/directives/gatling-details.client.directive.js */

    /**
     * @desc
     * @example <div requirements></div>
     */
    angular
        .module('graphs')
        .directive(
        'requirements', RequirementsDirective)

    function RequirementsDirective() {
        var directive = {
            restrict: 'EA',
            templateUrl: 'modules/graphs/views/requirements-directive.client.view.html',
            controller: RequirementsController,
            controllerAs: 'vm'
        };

        return directive;

        /* @ngInject */
        function RequirementsController (
            $scope,
            $timeout,
            $filter,
            $state,
            $stateParams,
            TestRuns,
            ngTableParams

        ) {


            $scope.showPassedRequirements = $stateParams.requirementsResult === "passed" ? true : false;

            /* set tab number based on url */

            $scope.tabNumber = $stateParams.requirementsResult === "passed" ? 0 : 1;

            $scope.setTab = function(newValue){
                $scope.tabNumber = newValue;
                switch (newValue) {
                    case 0:
                        $state.go('requirementsTestRun',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, "testRunId" : TestRuns.selected.testRunId, "requirementsResult" : "passed" });
                        break;
                    case 1:
                        $state.go('requirementsTestRun',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, "testRunId" : TestRuns.selected.testRunId, "requirementsResult" : "failed" });
                        break;
                }

                $scope.tableParams.filter({});
                $scope.tableParams.reload();


            };

            $scope.isSet = function(tabNumber){
                return $scope.tabNumber  === tabNumber;
            };


//            $scope.$watch('showPassedRequirements', function (newVal, oldVal) {

//                    if (newVal !== oldVal) {



                            $scope.tableParams = new ngTableParams({
                                page: 1,            // show first page
                                count: 50          // count per page

                            }, {
                                groupBy: 'metric',
                                total: 0, //data.length,
                                getData: function($defer, params) {

                                    TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

                                        $timeout(function () {

                                            TestRuns.selected = testRun;

                                            var data = [];


                                            _.each(testRun.metrics, function (metric) {

                                                /* only show metrics failed / passed requirements */
                                                if (metric.metricMeetsRequirement === $scope.showPassedRequirements) {

                                                    var tag = (metric.tags) ? metric.tags[0].text : 'All';

                                                    _.each(metric.targets, function (target) {


                                                        data.push({

                                                            target: target.target,
                                                            value: target.value,
                                                            targetMeetsRequirement: target.targetMeetsRequirement,
                                                            metric: metric.alias,
                                                            metricId: metric._id,
                                                            requirementOperator: metric.requirementOperator,
                                                            requirementValue: metric.requirementValue,
                                                            testRunId: testRun.testRunId,
                                                            productName: $stateParams.productName,
                                                            dashboardName: $stateParams.dashboardName,
                                                            tag: tag

                                                        });
                                                    });
                                                }
                                            });
                                            var orderedData = params.sorting() ?
                                            $filter('orderBy')(data, $scope.tableParams.orderBy()) : data;
                                            // update table params
                                            params.total(orderedData.length);
                                            $defer.resolve(orderedData);

                                        }, 500);
                                    });
                                }
                            });


//                        });

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
