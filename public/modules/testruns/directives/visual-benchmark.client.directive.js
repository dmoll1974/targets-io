'use strict';

angular.module('testruns').directive('visualBenchmark', VisualBenchmarkDirective);

function VisualBenchmarkDirective () {

  var directive = {

    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/visual-benchmark.client.view.html',
    controller: VisualBenchmarkDirectiveController
  };

  return directive;

  /* @ngInject */
  function VisualBenchmarkDirectiveController ($scope, $state, $timeout, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics, TestRuns, $mdToast, $modal, ConfirmModal) {


    $scope.graphType = 'testrun';

    $scope.benchmarkTestRuns = [];

    /* Get selected series params from query string */

    TestRuns.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';

    $scope.selectedSeries = TestRuns.selectedSeries;

      Metrics.get($stateParams.metricId).success(function(baselineMetric){

        TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.baselineTestRunId).success(function (baseline) {

          var metricIndex = baseline.metrics.map(function(metric){return metric.alias;}).indexOf(baselineMetric.alias);
          var targetIndex = baseline.metrics[metricIndex].targets.map(function(target){return target.target}).indexOf($scope.selectedSeries);

          $scope.benchmarkTestRuns.push({metric: baselineMetric, testrun: baseline, title:'Baseline', value: baseline.metrics[metricIndex].targets[targetIndex].value});

          Metrics.get($stateParams.metricId).success(function(benchmarkMetric){

            var prettybenchmarkOperator = benchmarkMetric.benchmarkOperator === '>' ? '+' : '-';
            $scope.allowedDeviation = prettybenchmarkOperator + benchmarkMetric.benchmarkValue ;

            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.benchmarkTestRunId).success(function (benchmark) {

              metricIndex = benchmark.metrics.map(function(metric){return metric.alias;}).indexOf(benchmarkMetric.alias);
              targetIndex = benchmark.metrics[metricIndex].targets.map(function(target){return target.target}).indexOf($scope.selectedSeries);

              $scope.benchmarkResult = evaluateBenchmark(benchmark.metrics[metricIndex].targets[targetIndex].value, baseline.metrics[metricIndex].targets[targetIndex].value, benchmarkMetric.benchmarkOperator, benchmarkMetric.benchmarkValue);

              $scope.benchmarkTestRuns.push({metric: benchmarkMetric, testrun: benchmark, title:'Benchmark', value: benchmark.metrics[metricIndex].targets[targetIndex].value});

              });

            });
          });

      });


    function evaluateBenchmark(value, baselineValue, benchmarkOperator, benchmarkValue) {
      var result = false;
      if (benchmarkOperator === '>') {
        if (value - baselineValue < benchmarkValue) {
          result = true;
        }
      } else {
        if (baselineValue - value < benchmarkValue) {
          result = true;
        }
      }
      return result;
    }



  }
}
