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
  function ($scope, $modal, $log, $rootScope, $stateParams, $state, $timeout, $location, Authentication, Metrics, Dashboards, ConfirmModal, TestRuns, Graphite) {
    $scope.authentication = Authentication;
    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;



    $scope.openMenu = function($mdOpenMenu, $event, target) {


    /* Check if current target returns any 'leafs'*/

      /* remove trailing dot */
      if(target.lastIndexOf('.') === (target.length - 1)){
        target = target.substring(0, target.length - 1);
      }

      Graphite.findMetrics(target + '.*').success(function(graphiteTargetsLeafs) {

        if (graphiteTargetsLeafs.length > 0) {
          var graphiteTargets = [];
          graphiteTargets.push({text: '*', id: '*'});

          _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
            graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
          });

          $scope.graphiteTargets = graphiteTargets;

        } else {

          $scope.graphiteTargets = $scope.defaultGraphiteTargets;

        }

        var menu = $mdOpenMenu($event);
          $timeout(function() {
          var menuContent = document.getElementById('targets-menu-content');

          function hasAnyAttribute(target, attrs) {
            if (!target) return false;
            for (var i = 0, attr; attr = attrs[i]; ++i) {
              var altForms = [attr, "data-" + attr, "x-" + attr];
              for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
                if (target.hasAttribute(rawAttr)) {
                  return true;
                }
              }
            }
            return false;
          };

          function getClosest(el, tagName, onlyParent) {
            if (el instanceof angular.element) el = el[0];
            tagName = tagName.toUpperCase();
            if (onlyParent) el = el.parentNode;
            if (!el) return null;
            do {
              if (el.nodeName === tagName) {
                return el;
              }
            } while (el = el.parentNode);
            return null;
          };
          menuContent.parentElement.addEventListener('click', function(e) {
            console.log('clicked');
            var target = e.target;
            do {
              if (target === menuContent) return;
              if (hasAnyAttribute(target, ["ng-click", "ng-href", "ui-sref"]) || target.nodeName == "BUTTON" || target.nodeName == "MD-BUTTON") {
                var closestMenu = getClosest(target, "MD-MENU");
                if (!target.hasAttribute("disabled") && (!closestMenu || closestMenu == opts.parent[0])) {
                  if (target.hasAttribute("md-menu-disable-close")) {
                    event.stopPropagation();
                    angular.element(target).triggerHandler('click');
                  }
                  return; //let it propagate
                }
                break;
              }
            } while (target = target.parentNode);
          }, true);
        });
      });
    };

    //$scope.openMenu = function ($mdOpenMenu, ev, target) {
    //
    //  /* Check if current target returns any 'leafs'*/
    //
    //  /* remove trailing dot */
    //  if(target.lastIndexOf('.') === (target.length - 1)){
    //    target = target.substring(0, target.length - 1);
    //  }
    //
    //  Graphite.findMetrics(target + '.*').success(function(graphiteTargetsLeafs) {
    //
    //    if (graphiteTargetsLeafs.length > 0) {
    //      var graphiteTargets = [];
    //      graphiteTargets.push({text: '*', id: '*'});
    //
    //      _.each(graphiteTargetsLeafs, function (graphiteTargetsLeaf) {
    //        graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
    //      });
    //
    //      $scope.graphiteTargets = graphiteTargets;
    //
    //    } else {
    //
    //      $scope.graphiteTargets = $scope.defaultGraphiteTargets;
    //
    //    }
    //
    //    originatorEv = ev;
    //    $mdOpenMenu(ev);
    //
    //  });
    //};

    /* get initial values for graphite target picker*/
    Graphite.findMetrics('*').success(function(graphiteTargetsLeafs){

      var graphiteTargets = [];

      _.each(graphiteTargetsLeafs, function(graphiteTargetsLeaf){
          graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
      });

      $scope.defaultGraphiteTargets = graphiteTargets;
      $scope.graphiteTargets = $scope.defaultGraphiteTargets;

    })
    /* values for form drop downs*/
    $scope.metricTypes = [
      'Average',
      'Maximum',
      'Minimum',
      'Last',
      'Slope'
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
    $scope.targets = [''];
    $scope.metric = {};
    $scope.metric.dashboardId = Dashboards.selected._id;
    $scope.metric.targets = [''];
    $scope.enableBenchmarking = 'disabled';
    $scope.enableRequirement = 'disabled';
    $scope.percentageOptions = [
      {
        alias: '10%',
        value: '0.1'
      },
      {
        alias: '25%',
        value: '0.25'
      },
      {
        alias: '50%',
        value: '0.5'
      },
      {
        alias: '100%',
        value: '1.00'
      },
      {
        alias: '200%',
        value: '2.00'
      },
      {
        alias: '300%',
        value: '3.00'
      },
      {
        alias: '400%',
        value: '4.00'
      },
      {
        alias: '500%',
        value: '5.00'
      }
    ];
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


    $scope.getTargets = function(target, graphiteTargetId, targetIndex){

      var query;

      if(graphiteTargetId === '*'){

        query = target + '.' + graphiteTargetId;

      }else{

        query = graphiteTargetId + '.*';
      }
      Graphite.findMetrics(query).success(function(graphiteTargetsLeafs){

        var graphiteTargets = [];
        if(graphiteTargetsLeafs.length > 0) graphiteTargets.push({text: '*', id: '*'});

        _.each(graphiteTargetsLeafs, function(graphiteTargetsLeaf){
          graphiteTargets.push({text: graphiteTargetsLeaf.text, id: graphiteTargetsLeaf.id});
        });

        $scope.graphiteTargets = graphiteTargets;

        if(graphiteTargetId === '*'){

          $scope.metric.targets[targetIndex] = target + '.' + graphiteTargetId;


        }else{

          $scope.metric.targets[targetIndex] = graphiteTargetId;
        }



      });
    };


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
            Dashboards.update().success(function (dashboard) {
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
        if (updateRequirements || updateBenchmarks) {
          $scope.updateTestrun = TestRuns.updateTestruns($stateParams.productName, $stateParams.dashboardName, $stateParams.metricId, updateRequirements, updateBenchmarks).success(function (testRuns) {
            TestRuns.list = testRuns;
          });
        }
        $location.path('browse/' + $stateParams.productName + '/' + $stateParams.dashboardName);
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
          Dashboards.update().success(function (dashboard) {
          });
      });

      $scope.metric.productName = $stateParams.productName;
      $scope.metric.dashboardName = $stateParams.dashboardName;
      Metrics.update($scope.metric).success(function (metric) {
        var updateRequirements = $scope.currentRequirement !== metric.requirementOperator + metric.requirementValue ? true : false;
        var updateBenchmarks = $scope.currentBenchmark !== metric.benchmarkOperator + metric.benchmarkValue ? true : false;
        /* if requirement or benchmark vlaues have changed, update test runs */
        if (updateRequirements || updateBenchmarks) {
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
      $state.go('createMetric', {
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
