'use strict';
// Metrics controller
angular.module('metrics').controller('MetricsController', [
  '$scope',
  '$modal',
  '$log',
  '$rootScope',
  '$stateParams',
  '$state',
  '$timeout',
  '$location',
  'Authentication',
  'Metrics',
  'Dashboards',
  'ConfirmModal',
  'TestRuns',
  'Graphite',
  '$mdToast',
  function ($scope, $modal, $log, $rootScope, $stateParams, $state, $timeout, $location, Authentication, Metrics, Dashboards, ConfirmModal, TestRuns, Graphite, $mdToast) {
    $scope.authentication = Authentication;
    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;

    $scope.sortType     = 'tags'; // set the default sort type
    $scope.sortReverse  = false;  // set the default sort order
    $scope.searchMetrics  = ''; // set the default sort order

    /* values for form drop downs*/
    $scope.metricTypes = [
      'Average',
      'Maximum',
      'Minimum',
      'Last',
      'Gradient'
    ];
    $scope.operatorOptions = [
      {
        alias: 'lower than',
        value: '<'
      },
      {
        alias: 'higher than',
        value: '>'
      }
    ];
    $scope.deviationOptions = [
      {
        alias: 'negative deviation',
        value: '<'
      },
      {
        alias: 'positive deviation',
        value: '>'
      },
      {
        alias: '',
        value: ''
      }
    ];
    $scope.metric = {};
    $scope.metric.dashboardId = Dashboards.selected._id;
    $scope.metric.targets = [''];
    $scope.enableBenchmarking = false;
    $scope.enableRequirement = false;
    $scope.metric.includeInSummary = false;

    $scope.$watch('enableRequirement', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.enableRequirement === false) {
          $scope.metric.requirementOperator = null;
          $scope.metric.requirementValue = null;
        }
      }
    });
    $scope.$watch('enableBenchmarking', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if ($scope.enableBenchmarking === false) {
          $scope.metric.benchmarkOperator = null;
          $scope.metric.benchmarkValue = null;
        }
      }
    });



    $scope.addTarget = function () {
      $scope.metric.targets.push('');
      $scope.graphiteTargets = $scope.defaultGraphiteTargets;
    };
    $scope.removeTarget = function (index) {
      $scope.metric.targets.splice(index, 1);
    };
    $scope.loadTags = function (query) {
      var matchedTags = [];
      _.each(Dashboards.selected.tags, function (tag) {
        if (tag.text.toLowerCase().match(query.toLowerCase()))
          matchedTags.push(tag);
      });
      return matchedTags;
    };
    $scope.initCreateForm = function () {
      if (Metrics.clone.alias)
        $scope.metric = Metrics.clone;
    };
    // Create new Metric
    $scope.create = function () {
      /* Update tags in Dashboard if any new are added */
      Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, $scope.metric.tags, function (tagsUpdated) {

        if (tagsUpdated)
            Dashboards.update(Dashboards.selected).success(function (dashboard) {
            });
      });
      $scope.metric.productName = $stateParams.productName;
      $scope.metric.dashboardName = $stateParams.dashboardName;
      $scope.currentRequirement = '';
      $scope.currentBenchmark = '';
      Metrics.create($scope.metric).success(function (metric) {
        /* reset cloned metric */
        Metrics.clone = {};
        var updateRequirements = $scope.currentRequirement !== metric.requirementOperator + metric.requirementValue ? true : false;
        var updateBenchmarks = $scope.currentBenchmark !== metric.benchmarkOperator + metric.benchmarkValue ? true : false;
        /* if requirement or benchmark values have changed, update test runs */
        if (updateRequirements || (updateBenchmarks && Dashboards.selected.useInBenchmark )) {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Test runs are being updated, this might take a while ...')).then(function(response) {

          });
          $scope.updateTestrun = TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName, $stateParams.metricId, updateRequirements, updateBenchmarks).success(function (testRuns) {
            TestRuns.list = testRuns;
          });
        }
        $state.go('viewDashboard', {productName:  $stateParams.productName, dashboardName: $stateParams.dashboardName});
      });
    };
    // Remove existing Metric
    $scope.remove = function (metric) {
      if (metric) {
        metric.$remove();
        for (var i in $scope.metrics) {
          if ($scope.metrics[i] === metric) {
            $scope.metrics.splice(i, 1);
          }
        }
      } else {
        $scope.metric.$remove(function () {
          $location.path('metrics');
        });
      }
    };
    // Update existing Metric
    $scope.update = function () {
      /* Update tags in Dashboard if any new are added */
      Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, $scope.metric.tags, function (tagsUpdated) {

        if (tagsUpdated)
          Dashboards.update(Dashboards.selected).success(function (dashboard) {
          });
      });

      $scope.metric.productName = $stateParams.productName;
      $scope.metric.dashboardName = $stateParams.dashboardName;



      Metrics.update($scope.metric).success(function (metric) {

        var updateIndex = Dashboards.selected.metrics.map(function(metric){ metric._id}).indexOf($scope.metric._id);
        Dashboards.selected.metrics[updateIndex] = $scope.metric;

        Dashboards.update(Dashboards.selected).success(function (dashboard) {
        });


        var updateRequirements = $scope.currentRequirement !== metric.requirementOperator + metric.requirementValue ? true : false;
        var updateBenchmarks = $scope.currentBenchmark !== metric.benchmarkOperator + metric.benchmarkValue ? true : false;

        /* if requirement or benchmark vlaues have changed, update test runs */
        if (updateRequirements || (updateBenchmarks && Dashboards.selected.useInBenchmark )) {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Test runs are being updated, this might take a while ...')).then(function(response) {

          });

          $scope.updateTestrun = TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName, $stateParams.metricId, updateRequirements, updateBenchmarks).success(function (testRuns) {
            TestRuns.list = testRuns;
            if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
            else
              $state.go($rootScope.previousState);
          });
        } else {
          if ($rootScope.previousStateParams)
            $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
            $state.go($rootScope.previousState);
        }
      });
    };
    // Find a list of Metrics
    $scope.find = function () {
      $scope.metrics = Metrics.query();
    };
    // Find existing Metric
    $scope.findOne = function () {
      Metrics.get($stateParams.metricId).success(function (metric) {

        $scope.metric = metric;
        /* set benchmark and requirement toggles */
        if ($scope.metric.requirementValue)
          $scope.enableRequirement = true;
        if ($scope.metric.benchmarkValue)
          $scope.enableBenchmarking = true;
        /* set current requirements */
        $scope.currentRequirement = metric.requirementOperator + metric.requirementValue;
        /* set current benchmark values */
        $scope.currentBenchmark = metric.benchmarkOperator + metric.benchmarkValue;
      });
    };
    $scope.clone = function () {
      $scope.metric._id = undefined;
      Metrics.clone = $scope.metric;
      $state.go('addMetric', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    };
    $scope.cancel = function () {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
    $scope.openDeleteConfirmation = function (size, index) {
      Metrics.selected = $scope.metric;
      ConfirmModal.itemType = 'Delete metric ';
      ConfirmModal.selectedItemId = $scope.metric._id;
      ConfirmModal.selectedItemDescription = $scope.metric.alias;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function (metricId) {
        Metrics.delete(metricId).success(function (metric) {
          /* refresh dashboard*/
          Dashboards.get($scope.productName, $scope.dashboardName).success(function (dashboard) {
            $scope.dashboard = Dashboards.selected;
            /* return to previous state*/
            $state.go($rootScope.previousState, $rootScope.previousStateParams);
          });
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  }
]);
