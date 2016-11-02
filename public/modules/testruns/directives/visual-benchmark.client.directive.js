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

    $scope.goBack = goBack;


    /* Watches */

    $scope.$on('$destroy', function () {
      // Make sure to unselect series
      Utils.selectedSeries = '';

    });


    /* activate */

    activate();

    /* functions */

    function activate() {

      $scope.graphType = 'testrun';

      $scope.benchmarkTestRuns = [];

      /* Get selected series params from query string */

      Utils.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';

      $scope.benchmarkType = $state.params.benchmarkType;

      $scope.selectedSeries = Utils.selectedSeries;

      Metrics.get($stateParams.metricId).success(function(baselineMetric){

        TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.baselineTestRunId).success(function (baseline) {

          var baselineMetricIndex = baseline.metrics.map(function(metric){return metric.alias;}).indexOf(baselineMetric.alias);
          var baselineTargetIndex = baseline.metrics[baselineMetricIndex].targets.map(function(target){return target.target}).indexOf($scope.selectedSeries);

          $scope.benchmarkTestRuns.push({metric: baselineMetric, testrun: baseline, title:'Baseline', value: baseline.metrics[baselineMetricIndex].targets[baselineTargetIndex].value});

          Metrics.get($stateParams.metricId).success(function(benchmarkMetric){

            var prettybenchmarkOperator = benchmarkMetric.benchmarkOperator === '>' ? '+' : '-';
            $scope.allowedDeviation = prettybenchmarkOperator + benchmarkMetric.benchmarkValue ;

            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.benchmarkTestRunId).success(function (benchmark) {

              var benchmarkMetricIndex = benchmark.metrics.map(function(metric){return metric.alias;}).indexOf(benchmarkMetric.alias);
              var benchmarkTargetIndex = benchmark.metrics[benchmarkMetricIndex].targets.map(function(target){return target.target}).indexOf($scope.selectedSeries);

              $scope.benchmarkResult = evaluateBenchmark(benchmark.metrics[benchmarkMetricIndex].targets[benchmarkTargetIndex].value, baseline.metrics[baselineMetricIndex].targets[baselineTargetIndex].value, benchmarkMetric.benchmarkOperator, benchmarkMetric.benchmarkValue);

              $scope.benchmarkTestRuns.push({metric: benchmarkMetric, testrun: benchmark, title:'Benchmark', value: benchmark.metrics[benchmarkMetricIndex].targets[benchmarkTargetIndex].value});

            });

          });
        });

      });

    }

    function goBack(testRun){

      if ($scope.benchmarkType === 'fixedBaseline'){

        $state.go('benchmarkFixedBaselineTestRun', {productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId, benchmarkResult:  $scope.benchmarkResult ? 'passed' : 'failed'})

      }else{

        $state.go('benchmarkPreviousBuildTestRun', {productName: testRun.productName, dashboardName: testRun.dashboardName, testRunId: testRun.testRunId, benchmarkResult:  $scope.benchmarkResult ? 'passed' : 'failed'})
      }

    }





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
