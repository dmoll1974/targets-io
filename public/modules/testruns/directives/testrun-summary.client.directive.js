'use strict';

angular.module('testruns').directive('testrunSummary', TestRunSummaryDirective);

function TestRunSummaryDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/testrun-summary.client.view.html',
    controller: TestRunSummaryDirectiveController
  };

  return directive;

  /* @ngInject */
  function TestRunSummaryDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics) {


    Utils.graphType = 'testrun';

    $scope.numberOfColumns = 1;
    $scope.requirements = [];
    $scope.editMode = false;


  /* get test run info */
    TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

      $scope.testRun = testRun;

      /* get dashboard info */

      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {

        $scope.dashboard = dashboard;

        /* merge requirements results from test run data*/

        $scope.metrics = addRequirementsResultsForTestRun($scope.dashboard.metrics, testRun.metrics);


        /* add default annotation texts to model */

        _.each($scope.metrics, function(metric){

           metric.summaryText = (metric.defaultSummaryText) ? (metric.defaultSummaryText) : '';

        })


      });


    });


    function addRequirementsResultsForTestRun(dashboardMetrics, testRunMetrics) {

      var summaryIndex = 0;

      _.each(dashboardMetrics, function (dashboardMetric, i) {

        /* add initial summaryIndeces */

        if(!dashboardMetric.summaryIndex && dashboardMetric.includeInSummary === true ){


          dashboardMetric.summaryIndex = summaryIndex;
          summaryIndex++;
          Metrics.update(dashboardMetric).success(function (metric) {

          });
        }



        _.each(testRunMetrics, function (testRunMetric) {

          if(dashboardMetric.alias === testRunMetric.alias && testRunMetric.meetsRequirement !== null){

            dashboardMetric.meetsRequirement = testRunMetric.meetsRequirement;

            var requirementText =  dashboardMetric.requirementOperator == "<" ? dashboardMetric.alias + ' should be lower then ' + dashboardMetric.requirementValue : dashboardMetric.alias + ' should be higher then ' + dashboardMetric.requirementValue;

            $scope.requirements.push({metricAlias: dashboardMetric.alias, requirementText: requirementText, meetsRequirement:testRunMetric.meetsRequirement });
          }


        });
      });

      return dashboardMetrics.sort(Utils.dynamicSort('summaryIndex'));
    }


    $scope.moveUp = function(metricToMove){

      var originalSummaryIndex = metricToMove.summaryIndex;
      var currentIndex = $scope.metrics.map(function(metric){return metric._id.toString()}).indexOf(metricToMove._id.toString());
      var newIndex = findNextSummaryMetricIndex($scope.metrics, currentIndex);
      var newSummaryIndex = $scope.metrics[newIndex].summaryIndex;

      //var tempArrayItem = $scope.metrics[newIndex];
      //$scope.metrics[newIndex] = $scope.metrics[currentIndex];
      //$scope.metrics[currentIndex] = tempArrayItem;

      /* switch metric summaryIndeces*/

      $scope.metrics[currentIndex].summaryIndex = $scope.metrics[currentIndex].summaryIndex - 1;

      $scope.metrics[newIndex].summaryIndex = $scope.metrics[newIndex].summaryIndex + 1;


      Metrics.update( $scope.metrics[currentIndex]).success(function (updatedMetricToMove) {


        Metrics.update( $scope.metrics[newIndex]).success(function (updatedMovedMetric) {


          //$scope.metrics = $scope.metrics.sort(Utils.dynamicSort('summaryIndex'));


        });


      });




    };

    function findNextSummaryMetricIndex(metrics, index){

      var sortedMetrics = metrics.sort(Utils.dynamicSort('summaryIndex'));

      for(var i = index - 1 ; i > 0; i--){

        if (metrics[i].includeInSummary === true) break;

      }

      return i;
    }

    $scope.editMetric = function(metricId){

      $state.go('editMetric',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName, metricId: metricId });

    };

    $scope.testRunDetails = function (testRun, metricAlias) {
      TestRuns.selected = testRun;

      if (metricAlias === 'all')
        {

          $state.go('viewGraphs', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': testRun.testRunId,
            tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
          });
        }else{

        $state.go('viewGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          'testRunId': testRun.testRunId,
          tag: Dashboards.getDefaultTag(Dashboards.selected.tags),
          metricFilter: metricAlias
        });


      }


    };

    $scope.testRunSummaryConfig = function(){

      $state.go('testRunSummaryConfig', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    }

    $scope.cancel = function () {
      /* reset form*/
      $scope.testrunForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

  }
}
