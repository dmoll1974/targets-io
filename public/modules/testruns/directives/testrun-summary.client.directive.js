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
  function TestRunSummaryDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics, TestRunSummary, $mdToast, $modal, ConfirmModal, $timeout) {


    Utils.graphType = 'testrun';

    $scope.testRunSummary = {};
    $scope.testRunSummary.requirements = [];
    /* if coming from edit metric screen, set edit mode and updated to true */
    $scope.editMode = $rootScope.previousState.includes('editMetric')? true : false;
    $scope.updated = $rootScope.previousState.includes('editMetric')? true : false;
    $scope.hideGraphs = false;

    var converter = new showdown.Converter({extensions: ['targetblank']});


    $scope.$watch('testRunSummary.markDown', function (newVal, oldVal) {

      if (newVal !== undefined) {

        var markDownToHTML = converter.makeHtml(newVal);

        $timeout(function () {

          document.getElementById('markdown').innerHTML = markDownToHTML;

        }, 100)
      }
    });

    $scope.markAsUpdated = function(){

      $scope.updated = true;
    }

    TestRunSummary.getTestRunSummary($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRunSummary) {

      if(testRunSummary){

        $scope.testRunSummary = testRunSummary;
        $scope.summarySaved = true;

        console.log('got test run summary from db!')

      }else {

        $scope.summarySaved = false;

        createTestRunSummary (false);
      }
  });

    function createTestRunSummary (update){

      /* get test run info */

      TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

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

        Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {

          $scope.testRunSummary.description = dashboard.description;
          $scope.testRunSummary.goal = dashboard.goal;

          /* add requirements */
          addRequirements(testRun.metrics, dashboard.metrics);


          if (update === true){

            var newTestRunSummaryMetrics = [];

            newTestRunSummaryMetrics = getNewMetrics(dashboard.metrics, $scope.testRunSummary.metrics);

            _.each(addMetricsToSummary(newTestRunSummaryMetrics), function(newMetric){

              newMetric.summaryText = (newMetric.defaultSummaryText) ? newMetric.defaultSummaryText : '';
              $scope.testRunSummary.metrics.push(newMetric);

            })



            $scope.updated = true;

          }else{

            /* Add metrics*/

            $scope.testRunSummary.metrics = addMetricsToSummary(dashboard.metrics);

            /* add default annotation texts to model */

            _.each($scope.testRunSummary.metrics, function (metric) {

              metric.summaryText = (metric.defaultSummaryText) ? metric.defaultSummaryText : '';

            })


          }



        });


      });

    }

    function getNewMetrics(testRunMetrics, testRunSummaryMetrics){

      var newMetrics = [];

      _.each(testRunMetrics, function(testRunMetric){

        var index = testRunSummaryMetrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(testRunMetric._id);

        if(index === -1 && testRunMetric.includeInSummary === true ) newMetrics.push(testRunMetric);


      })

      return newMetrics;
    }

    $scope.restoreDefaultAnnotation = function(metric){

      Metrics.get(metric._id).success(function(storedMetric){

        var index =  $scope.testRunSummary.metrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(storedMetric._id);

        $scope.testRunSummary.metrics[index].summaryText = storedMetric.defaultSummaryText;
        $scope.updated = true;

      })
    }

    $scope.deleteFromTestRunSummary = function(metric){

      var index =  $scope.testRunSummary.metrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(metric._id);

      $scope.testRunSummary.metrics.splice(index, 1);

      $scope.updated = true;
    }

    $scope.gatlingDetails = function(testRunId){

      $state.go('viewGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRunId,
        'tag': 'Gatling'
      });
    }

    function addMetricsToSummary(dashboardMetrics) {

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

      });

      return metricsInSummary.sort(Utils.dynamicSort('summaryIndex'));

    }

    function addRequirements(testRunMetrics, dashboardMetrics){

      if($scope.testRunSummary.requirements.length > 0) $scope.testRunSummary.requirements = [];

      _.each(dashboardMetrics, function (dashboardMetric, i) {

          _.each(testRunMetrics, function (testRunMetric) {

            if(dashboardMetric.alias === testRunMetric.alias && testRunMetric.meetsRequirement !== null){

              dashboardMetric.meetsRequirement = testRunMetric.meetsRequirement;

              var requirementText =  dashboardMetric.requirementOperator == "<" ? dashboardMetric.alias + ' should be lower than ' + dashboardMetric.requirementValue : dashboardMetric.alias + ' should be higher than ' + dashboardMetric.requirementValue;

              var tag = dashboardMetric.tags.length > 0 ? dashboardMetric.tags[0].text : 'All';

              $scope.testRunSummary.requirements.push({metricAlias: dashboardMetric.alias, tag: tag, requirementText: requirementText, meetsRequirement:testRunMetric.meetsRequirement });
            }


          });
      });
    }

    $scope.moveUp = function(metricToMove){

      var originalSummaryIndex = metricToMove.summaryIndex;
      var currentIndex = $scope.testRunSummary.metrics.map(function(metric){return metric._id.toString()}).indexOf(metricToMove._id.toString());
      var newIndex = findNextSummaryMetricIndex($scope.testRunSummary.metrics, currentIndex);
      var newSummaryIndex = $scope.testRunSummary.metrics[newIndex].summaryIndex;

      //var tempArrayItem = $scope.testRunSummary.metrics[newIndex];
      //$scope.testRunSummary.metrics[newIndex] = $scope.testRunSummary.metrics[currentIndex];
      //$scope.testRunSummary.metrics[currentIndex] = tempArrayItem;

      /* switch metric summaryIndeces*/

      $scope.testRunSummary.metrics[currentIndex].summaryIndex = $scope.testRunSummary.metrics[currentIndex].summaryIndex - 1;

      $scope.testRunSummary.metrics[newIndex].summaryIndex = $scope.testRunSummary.metrics[newIndex].summaryIndex + 1;


      Metrics.update( $scope.testRunSummary.metrics[currentIndex]).success(function (updatedMetricToMove) {


        Metrics.update( $scope.testRunSummary.metrics[newIndex]).success(function (updatedMovedMetric) {


          $scope.testRunSummary.metrics = $scope.testRunSummary.metrics.sort(Utils.dynamicSort('summaryIndex'));


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

    $scope.testRunDetails = function (testRun, requirement) {
      TestRuns.selected = testRun;

      if (requirement === 'all')
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
          tag: requirement.tag,
          metricFilter: requirement.metricAlias
        });


      }


    };

    $scope.testRunSummaryConfig = function(){

      $state.go('testRunSummaryConfig', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    }


    $scope.submitTestRunSummary = function() {

      submitTestRunSummary();
    }


    function submitTestRunSummary(){

    /* set summaryIndeces in current order of the scope */


        _.each($scope.testRunSummary.metrics, function(metric, i){

          metric.summaryIndex = i;

        })


        if ($scope.summarySaved === false) {


          TestRunSummary.addTestRunSummary($scope.testRunSummary).success(function(savedTestRunSummary){


            $scope.summarySaved = true;
            $scope.updated  = false;

            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top center')
                .parent(angular.element('#summary-buttons'))
                .hideDelay(6000);

            $mdToast.show(toast.content('Test run summary saved')).then(function(response) {

            });

          })

        } else {



          TestRunSummary.updateTestRunSummary($scope.testRunSummary).success(function(updatedTestRunSummary){


            $scope.summarySaved = true;
            $scope.updated  = false;


            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top center')
                .parent(angular.element('#summary-buttons'))
                .hideDelay(6000);

            $mdToast.show(toast.content('Test run summary updated')).then(function(response) {

            });

          })

        }

    }


    $scope.$on('$destroy', function () {
      /* if updates have been made and not saved, prompt the user */
      if($scope.updated === true && !$rootScope.currentState.includes('editMetric') && !$rootScope.currentState.includes('testRunSummary')){

        ConfirmModal.itemType = 'Save changes to test run summary ';
        ConfirmModal.selectedItemDescription =  $scope.testRunSummary.testRunId;
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: ''  //,
        });
        modalInstance.result.then(function () {
          submitTestRunSummary()
        }, function () {

          /* return to previous state*/
          //$state.go($rootScope.previousState, $rootScope.previousStateParams);

        });
      }
    });

    $scope.reloadTestRunSummary = function(){

      createTestRunSummary(true);

    }


    $scope.openDeleteModal = function (size, testRunSummary) {
      ConfirmModal.itemType = 'Delete saved test run summary for ';
      ConfirmModal.selectedItemDescription = testRunSummary.testRunId;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        TestRunSummary.deleteTestRunSummary(testRunSummary).success(function () {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(6000);

          $mdToast.show(toast.content('Test run summary deleted from db')).then(function(response) {

          });
          /* reload*/
          $state.go($state.current, {}, { reload: true });
        });
      }, function () {
      });
    };

  }
}
