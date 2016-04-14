/*jshint maxerr: 10000 */
'use strict';
angular.module('graphs').controller('HighchartsLiveController', [
  '$scope',
  'Interval',
  '$stateParams',
  '$state',
  'Graphite',
  'TestRuns',
  'Metrics',
  'Dashboards',
  'Tags',
  '$q',
  '$http',
  '$log',
  'Events',
  'Utils',
  function ($scope, Interval, $stateParams, $state, Graphite, TestRuns, Metrics, Dashboards, Tags, $q, $http, $log, Events, Utils) {
    

    
    /* Zero copied logic */
    $scope.clipClicked = function () {
      $scope.showUrl = false;
    };
    $scope.hasFlash = function () {
      var hasFlash = false;
      try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
          return hasFlash;
        }
      } catch (e) {
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };

    /* set zoomLock */
    Utils.zoomLock = true;

    /* set graphType */
    Utils.graphType =  'graphs-live';
    $scope.graphType =  'graphs-live';

    /* set Tags form graph */
    $scope.setTags = function () {
      if ($scope.showTags) {
        switch ($scope.showTags) {
          case true:
            $scope.showTags = false;
            break;
          case false:
            $scope.showTags = true;
            break;
        }
      } else {
        $scope.showTags = true;
      }
    };
    /* update Tags form graph */
    /* update Tags form graph */
    $scope.updateTags = function (tag) {
      $scope.showTags = false;
      Metrics.update($scope.metric).success(function (metric) {
        Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, metric.tags, function (updated) {
          if (updated) {
            Dashboards.update(Dashboards.selected).success(function (dashboard) {
              $scope.dashboard = Dashboards.selected;
              /* Get tags used in metrics */
              $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
            });
          }
        });
        $state.go('viewLiveGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          tag: tag  //metric.tags[metric.tags.length - 1].text
        });
      });
    };
    $scope.tagRemoved = function (tag) {
      if (tag.text === $stateParams.tag) {
        Metrics.update($scope.metric).success(function (metric) {

          /* Update tags in Dashboard if any new are added */
          Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, $scope.metric.tags, function (tagsUpdated) {

            if (tagsUpdated) {
              Dashboards.update(Dashboards.selected).success(function (dashboard) {
                $scope.dashboard = Dashboards.selected;
                /* Get tags used in metrics */
                $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
              });

            }
          });
          $state.go($state.current, {}, { reload: true });
        });
      }
    };

    /* generate deeplink to share metric graph */
    $scope.setMetricShareUrl = function (metric) {

      $scope.metricShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?zoomRange=' + Utils.zoomRange.value;

      if (Utils.zoomFrom) {
        $scope.metricShareUrl = $scope.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }

      $scope.metricShareUrl = $scope.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);

      if ($scope.showUrl) {
        switch ($scope.showUrl) {
          case true:
            $scope.showUrl = false;
            break;
          case false:
            $scope.showUrl = true;
            break;
        }
      } else {
        $scope.showUrl = true;
      }
    };
    /* If zoom lock is checked, update all graphs when zoom is applied in one */
    $scope.$watch(function (scope) {
      return Utils.zoomFrom;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal && oldVal) {
        Interval.clearAll();
        var from = Utils.zoomFrom ? Utils.zoomFrom : TestRuns.selected.startEpoch;
        var until = Utils.zoomUntil ? Utils.zoomUntil : TestRuns.selected.endEpoch;
        var chart = angular.element($scope.graphSelector).highcharts();
        while (chart.series.length > 0) {
          chart.series[0].remove(false);  //deletes all series
        }
        chart.showLoading('Loading data ...');
        updateGraph(Utils.zoomFrom, Utils.zoomUntil, $scope.metric.targets, function (series) {
          chart.hideLoading();
          _.each(series, function (serie) {
            chart.addSeries(serie, false);
          });
          chart.redraw();
        });
      }
    });
    /* Open accordion by default, except for the "All" tab */
    $scope.$watch('value', function (newVal, oldVal) {

      if(newVal !==  oldVal) {

        Utils.metricFilter = '';

      }
      if (newVal !== 'All' || $scope.metricFilter !== '') {
        _.each($scope.metrics, function (metric, i) {
          $scope.metrics[i].isOpen = true;
        });
      }

    });

    /* stop data polling when accordion is closed */
    $scope.$watch('metric.isOpen', function (newVal, oldVal) {
      if (newVal !== oldVal && newVal === false)
        Interval.clearIntervalForMetric($scope.metric._id);
    });
    /* stop data polling when element is destroyed by ng-if */
    $scope.$on('$destroy', function () {
      Interval.clearIntervalForMetric($scope.metric._id);
    });
    /* reinitialise graph when zoomRange is changed */
    //$scope.$watch('zoomRange', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    Utils.zoomRange = $scope.zoomRange;
    //}
    //});

  }
]);
