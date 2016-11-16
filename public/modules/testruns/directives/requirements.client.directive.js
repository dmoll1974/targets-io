(function () {
  'use strict';
  /* public/modules/graphs/directives/gatling-details.client.directive.js */
  /**
     * @desc
     * @example <div requirements></div>
     */
  angular.module('testruns').directive('requirements', RequirementsDirective);
  function RequirementsDirective() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/testruns/directives/requirements-directive.client.view.html',
      controller: RequirementsController,
      controllerAs: 'vm'
    };
    return directive;
    /* @ngInject */
    function RequirementsController($scope, $rootScope, $timeout, $filter, $state, $stateParams, TestRuns, ngTableParams, Utils) {

      $scope.back = back;
      $scope.setTab = setTab;
      $scope.isSet = isSet;
      $scope.goBack = goBack;

        /* activate */

      activate();

      /* functions */

      function activate() {
        $scope.showPassedRequirements = $stateParams.requirementsResult === 'passed' ? true : false;
        $scope.productName = $stateParams.productName;
        $scope.dashboardName = $stateParams.dashboardName;


        if ($state.params.selectedMetric) $scope.selectedMetric = $state.params.selectedMetric;

        /* set tab number based on url */
        $scope.tabNumber = $stateParams.requirementsResult === 'passed' ? 0 : 1;

        $scope.tableParams = new ngTableParams({
          page: 1,
          // show first page
          count: 50  // count per page
        }, {
          groupBy: 'metric',
          total: 0,
          //data.length,
          getData: function ($defer, params) {
            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
              $timeout(function () {
                TestRuns.selected = testRun;
                $scope.testRun = testRun;
                var data = [];
                /* sort metrics*/
                testRun.metrics = testRun.metrics.sort(Utils.dynamicSortTags(''));
                _.each(testRun.metrics, function (metric) {

                  /* sort targets*/
                  metric.targets = metric.targets.sort(Utils.dynamicSort('target'));
                  /* only show metrics failed / passed requirements */
                  if (metric.meetsRequirement === $scope.showPassedRequirements) {
                    var tag = metric.tags.length > 0 ? metric.tags[0].text : 'All';
                    _.each(metric.targets, function (target) {
                      data.push({
                        target: target.target,
                        value: target.value,
                        meetsRequirement: target.meetsRequirement,
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
                var orderedData = params.sorting() ? $filter('orderBy')(data, $scope.tableParams.orderBy()) : data;


                // update table params

                params.total(data.length);
                $defer.resolve(data);
              }, 500);
            });
          }
        });

      }

      function back(){

        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);

      };

      function setTab(newValue) {
        $scope.tabNumber = newValue;
        switch (newValue) {
        case 0:
          $state.go('requirementsTestRun', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': TestRuns.selected.testRunId,
            'requirementsResult': 'passed'
          });
          break;
        case 1:
          $state.go('requirementsTestRun', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': TestRuns.selected.testRunId,
            'requirementsResult': 'failed'
          });
          break;
        }
        $scope.tableParams.filter({});
        $scope.tableParams.reload();
      };

      function isSet(tabNumber) {
        return $scope.tabNumber === tabNumber;
      };

      function goBack(testRun){

        $state.go('viewDashboard',{productName: testRun.productName, dashboardName: testRun.dashboardName});
      }
    }
  }
  function LoadingContainerDirective() {
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
