(function () {
  'use strict';
  /**
     * @desc
     * @example <div requirements></div>
     */
  angular.module('testruns').directive('benchmarkPreviousBuild', BenchmarkPreviousBuildDirective);
  function BenchmarkPreviousBuildDirective() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/testruns/views/benchmark-previous-build-directive.client.view.html',
      controller: BenchmarkPreviousBuildController,
      controllerAs: 'vm'
    };
    return directive;
    /* @ngInject */
    function BenchmarkPreviousBuildController($scope, $timeout, $filter, $state, $stateParams, TestRuns, ngTableParams) {
      $scope.showPassed = $stateParams.benchmarkResult === 'passed' ? true : false;
      $scope.productName = $stateParams.productName;
      $scope.dashboardName = $stateParams.dashboardName;
      /* set tab number based on url */
      $scope.tabNumber = $stateParams.benchmarkResult === 'passed' ? 0 : 1;
      $scope.setTab = function (newValue) {
        $scope.tabNumber = newValue;
        switch (newValue) {
        case 0:
          $state.go('benchmarkPreviousBuildTestRun', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': TestRuns.selected.testRunId,
            'benchmarkResult': 'passed'
          });
          break;
        case 1:
          $state.go('benchmarkPreviousBuildTestRun', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': TestRuns.selected.testRunId,
            'benchmarkResult': 'failed'
          });
          break;
        }
        $scope.tableParams.filter({});
        $scope.tableParams.reload();
      };
      $scope.isSet = function (tabNumber) {
        return $scope.tabNumber === tabNumber;
      };
      //            $scope.$watch('showPassed', function (newVal, oldVal) {
      //                    if (newVal !== oldVal) {
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
                if (metric.benchmarkResultPreviousOK === $scope.showPassed) {
                  var tag = metric.tags.length > 0 ? metric.tags[0].text : 'All';
                  _.each(metric.targets, function (target) {
                    if (target.benchmarkResultPreviousOK === $scope.showPassed) {
                      var humanReadableBenchmarkOperator = metric.benchmarkOperator === '>' ? '+' : '-';
                      data.push({
                        target: target.target,
                        value: target.value,
                        benchmarkResultPreviousOK: target.benchmarkResultPreviousOK,
                        benchmarkResultFixedOK: target.benchmarkResultFixedOK,
                        benchmarkPreviousValue: target.benchmarkPreviousValue,
                        benchmarkFixedValue: target.benchmarkFixedValue,
                        meetsRequirement: target.meetsRequirement,
                        metric: metric.alias,
                        metricId: metric._id,
                        requirementOperator: metric.requirementOperator,
                        requirementValue: metric.requirementValue,
                        benchmarkOperator: humanReadableBenchmarkOperator,
                        benchmarkValue: metric.benchmarkValue,
                        testRunId: testRun.testRunId,
                        productName: $stateParams.productName,
                        dashboardName: $stateParams.dashboardName,
                        tag: tag
                      });
                    }
                  });
                }
              });
              var orderedData = params.sorting() ? $filter('orderBy')(data, $scope.tableParams.orderBy()) : data;
              // update table params
              params.total(orderedData.length);
              $defer.resolve(orderedData);
            }, 500);
          });
        }
      });  //                        });
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
