'use strict';

angular.module('testruns').directive('releaseTestrunSummary', ReleaseTestRunSummaryDirective);

function ReleaseTestRunSummaryDirective () {

  var directive = {
    scope: {
      testrun: '=',
      index: '=',
      productrequirements: '=',
      edit: '='
    },

    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-release/release-testrun-summary.client.view.html',
    controller: ReleaseTestRunSummaryDirectiveController
  };

  return directive;

  /* @ngInject */
  function ReleaseTestRunSummaryDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics, TestRunSummary, $mdToast, $modal, ConfirmModal, $timeout) {


    console.log("relatedTestRun: " + $scope.testrun);

    Utils.graphType = 'testrun';

    $scope.testRunSummary = {};
    $scope.testRunSummary.requirements = [];
    $scope.showTestRunDetails = false;

    $scope.productName = $scope.testrun.productName;
    $scope.dashboardName = $scope.testrun.dashboardName;
    $scope.testRunId = $scope.testrun.testRunId;

    TestRunSummary.getTestRunSummary($scope.productName, $scope.dashboardName, $scope.testRunId).success(function (testRunSummary) {

      if(testRunSummary){

        $scope.testRunSummary = testRunSummary;
        $scope.summarySaved = true;

        console.log('got test run summary from db!')

      }else {

        $scope.summarySaved = false;

        /* get test run info */

        TestRuns.getTestRunById($scope.productName, $scope.dashboardName, $scope.testRunId).success(function (testRun) {

          $scope.testRunSummary.productName = testRun.productName;
          $scope.testRunSummary.productRelease = testRun.productRelease;
          $scope.testRunSummary.dashboardName = testRun.dashboardName;
          $scope.testRunSummary.testRunId = testRun.testRunId;
          $scope.testRunSummary.start = testRun.start;
          $scope.testRunSummary.end = testRun.end;
          $scope.testRunSummary.humanReadableDuration = testRun.humanReadableDuration;
          $scope.testRunSummary.annotations = (testRun.annotations)? testRun.annotations : 'None';
          if (testRun.buildResultsUrl){
            $scope.testRunSummary.buildResultsUrl = testRun.buildResultsUrl;
            /* in case of Jenkins CI server, get last two url parameters to display */
            var splitbuildResultsUrl = testRun.buildResultsUrl.split('/');
            $scope.testRunSummary.buildResultsUrlDisplay = splitbuildResultsUrl[splitbuildResultsUrl.length -3] + ' #' + splitbuildResultsUrl[splitbuildResultsUrl.length -2];
          }


          /* get dashboard info */

          Dashboards.get($scope.productName, $scope.dashboardName).success(function (dashboard) {

            $scope.testRunSummary.description = dashboard.description;
            $scope.testRunSummary.goal = dashboard.goal;


            /* merge requirements results from test run data*/

            $scope.testRunSummary.metrics = addRequirementsResultsForTestRun(dashboard.metrics, testRun.metrics);


            /* add default annotation texts to model */

            _.each($scope.testRunSummary.metrics, function (metric) {

              metric.summaryText = (metric.defaultSummaryText) ? metric.defaultSummaryText : '';

            })


          });


        });
      }
  });

    var converter = new showdown.Converter({extensions: ['targetblank']});

    $scope.$watch('testRunSummary.markDown', function (newVal, oldVal) {

      var markDownToHTML = converter.makeHtml(newVal);

      $timeout(function(){

        var markDownId = 'markdown-testrun-summary-' + $scope.index;
        document.getElementById(markDownId).innerHTML = markDownToHTML;

      },100)

    });

    $scope.goToTestRunSummary = function(){

      $state.go('testRunSummary', {
        'productName': $scope.testrun.productName,
        'dashboardName': $scope.testrun.dashboardName,
        'testRunId': $scope.testrun.testRunId
      });

    }

    $scope.toggleShowTestRunDetails = function(){

      $scope.showTestRunDetails = ($scope.showTestRunDetails === false)? true : false;

      if($scope.showTestRunDetails === true){

        var element = '#show-detailed-testrun-summary-' + $scope.index;

        var toast = $mdToast.simple()
            .action('OK')
            .highlightAction(true)
            .position('bottom left')
            .parent(angular.element(element))
            .hideDelay(3000);

        $mdToast.show(toast.content('Scroll down to view test run summary details ...')).then(function(response) {

        });
      }

    }

    $scope.gatlingDetails = function(testRunId){

      $state.go('viewGraphs', {
        'productName': $scope.productName,
        'dashboardName': $scope.dashboardName,
        'testRunId': testRunId,
        'tag': 'Gatling'
      });
    }

    function addRequirementsResultsForTestRun(dashboardMetrics, testRunMetrics) {

      var summaryIndex = 0;
      var metricsInSummary = [];

      _.each(dashboardMetrics, function (dashboardMetric, i) {

        /* add initial summaryIndeces */

        if(dashboardMetric.includeInSummary === true ) {

          if (!dashboardMetric.summaryIndex) {


            dashboardMetric.summaryIndex = summaryIndex;
            summaryIndex++;
            Metrics.update(dashboardMetric).success(function (metric) {

            });
          }

          metricsInSummary.push(dashboardMetric);
        }


        _.each(testRunMetrics, function (testRunMetric) {

          if(dashboardMetric.alias === testRunMetric.alias && testRunMetric.meetsRequirement !== null){

            dashboardMetric.meetsRequirement = testRunMetric.meetsRequirement;

            var requirementText =  dashboardMetric.requirementOperator == "<" ? dashboardMetric.alias + ' should be lower than ' + dashboardMetric.requirementValue : dashboardMetric.alias + ' should be higher than ' + dashboardMetric.requirementValue;

            var tag = dashboardMetric.tags.length > 0 ? dashboardMetric.tags[0].text : 'All';

            $scope.testRunSummary.requirements.push({metricAlias: dashboardMetric.alias, tag: tag, requirementText: requirementText, meetsRequirement:testRunMetric.meetsRequirement });
          }


        });
      });

      return metricsInSummary.sort(Utils.dynamicSort('summaryIndex'));
    }


    $scope.toggleRequirementResult = function (index){

      $scope.productrequirements[index].result = !$scope.productrequirements[index].result;

      $timeout(function(){

        $scope.$parent.$parent.updated = true;

      },1)

    }


    $scope.testRunDetails = function (testRun, requirement) {
      TestRuns.selected = testRun;

      if (requirement === 'all')
        {

          $state.go('viewGraphs', {
            'productName': $scope.productName,
            'dashboardName': $scope.dashboardName,
            'testRunId': testRun.testRunId,
            tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
          });
        }else{

        $state.go('viewGraphs', {
          'productName': $scope.productName,
          'dashboardName': $scope.dashboardName,
          'testRunId': testRun.testRunId,
          tag: requirement.tag,
          metricFilter: requirement.metricAlias
        });


      }


    };


  }
}
