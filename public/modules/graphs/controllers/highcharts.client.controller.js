'use strict';
angular.module('graphs').controller('HighchartsController', [
  '$scope',
  'Graphite',
  '$stateParams',
  '$state',
  'TestRuns',
  'Metrics',
  'Dashboards',
  'Tags',
  'Events',
  '$document',
  'Utils',
  function ($scope, Graphite, $stateParams, $state, TestRuns, Metrics, Dashboards, Tags, Events, $document, Utils) {
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
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };



    /* set graphType */
    Utils.graphType =  'testrun';
    $scope.graphType =  'testrun';

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
        $state.go('viewGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          'testRunId': $stateParams.testRunId,
          tag: tag //metric.tags[metric.tags.length - 1].text
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

      $scope.metricShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/?';
      //if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter) {
      //  $scope.metricShareUrl = $scope.metricShareUrl + '?';
      //}
      if (Utils.zoomFrom) {
        $scope.metricShareUrl = $scope.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }
      if ($state.params.selectedSeries) {
        $scope.metricShareUrl = $scope.metricShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
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
    /* Open accordion by default, except for the "All" tab */
    $scope.$watch('value', function (newVal, oldVal) {

        if(newVal !== oldVal) {

          Utils.metricFilter = '';

        }
        if (newVal !== 'All' || $scope.metricFilter !== '') {
          _.each($scope.metrics, function (metric, i) {
            $scope.metrics[i].isOpen = true;
          });
        }

    });

  }
]);
