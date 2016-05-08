'use strict';

angular.module('graphs').directive('graphsContent', GraphsContentDirective);

function GraphsContentDirective () {

  var directive = {
    scope: {
      metric: '='
    },
    restrict: 'EA',
    templateUrl: 'modules/graphs/directives/graphs-content.client.view.html',
    controller: GraphsContentDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function GraphsContentDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, Utils, Metrics, Tags, $timeout) {

    var vm = this;

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;
    //vm.value = $stateParams.tag;
    //vm.filteredMetrics = $scope.metrics;
    //vm.numberOfColumns = $scope.numberofcolumns;
    vm.graphsType = $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';



    vm.setMetricShareUrl = setMetricShareUrl;
    vm.editMetric = editMetric;
    vm.loadTags = loadTags;
    vm.setTags = setTags;
    vm.updateTags = updateTags;
    vm.tagRemoved = tagRemoved;
    vm.hasFlash = hasFlash;
    vm.clipClicked =clipClicked;


    activate();




    /* Open accordion by default, except for the "All" tab */
    //$scope.$watch('metrics', function (newVal, oldVal) {
    //
    //  if(newVal !== oldVal) {
    //
    //    vm.filteredMetrics = $scope.metrics;
    //    vm.columnsArray =[];
    //
    //    var itemsPerColumn = Math.ceil( vm.filteredMetrics.length / vm.numberOfColumns);
    //
    //    //Populates the column array
    //    for (var i=0; i< vm.filteredMetrics.length; i += itemsPerColumn) {
    //      var col = { start: i, end: Math.min(i + itemsPerColumn,  vm.filteredMetrics.length) };
    //      vm.columnsArray.push(col);
    //    }
    //  }
    //});







    function activate(){

    }


    /* generate deeplink to share metric graph */
    function setMetricShareUrl(metric) {

      switch(vm.graphsType){

        case 'graphs-live':

          vm.metricShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?zoomRange=' + Utils.zoomRange.value;

          if (Utils.zoomFrom) {
            vm.metricShareUrl = vm.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
          }

          /* zoom range */
          if (Utils.zoomRange) {
            vm.viewShareUrl = vm.viewShareUrl + '&zoomRange=' + Utils.zoomRange;
          }
          vm.metricShareUrl = vm.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);

          break;

        case 'testrun':

          vm.metricShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/?';


          if (Utils.zoomFrom) {
            vm.metricShareUrl = vm.metricShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
          }
          if ($state.params.selectedSeries) {
            vm.metricShareUrl = vm.metricShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
          }

          vm.metricShareUrl = vm.metricShareUrl + '&metricFilter=' + encodeURIComponent(metric.alias);

      }


      if (vm.showUrl) {
        switch (vm.showUrl) {
          case true:
            vm.showUrl = false;
            break;
          case false:
            vm.showUrl = true;
            break;
        }
      } else {
        vm.showUrl = true;
      }
    };

    function editMetric(metricId) {
      $state.go('editMetric', {
        productName: $stateParams.productName,
        dashboardName: $stateParams.dashboardName,
        metricId: metricId
      });
    };

    function loadTags(query) {
      var matchedTags = [];
      _.each(Dashboards.selected.tags, function (tag) {
        if (tag.text.toLowerCase().match(query.toLowerCase()))
          matchedTags.push(tag);
      });
      return matchedTags;
    };

    //function updateFilterTags(filterTags, filterOperator, persistTag, callback) {
    //  var combinedTag;
    //  var newTags = [];
    //  _.each(filterTags, function (filterTag, index) {
    //    switch (index) {
    //      case 0:
    //        combinedTag = filterTag.text + filterOperator;
    //        break;
    //      case filterTags.length - 1:
    //        combinedTag += filterTag.text;
    //        break;
    //      default:
    //        combinedTag += filterTag.text + filterOperator;
    //    }
    //  });
    //  newTags.push({ text: combinedTag });
    //  Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, newTags, function (tagsUpdated) {
    //    /* if persist tag is checked and tags are updated, update dashboard tags*/
    //    if (tagsUpdated && persistTag) {
    //      Dashboards.update(Dashboards.selected).success(function (dashboard) {
    //        vm.dashboard = Dashboards.selected;
    //        /* Get tags used in metrics */
    //        //vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
    //        callback(newTags);
    //      });
    //    } else {
    //      callback(newTags);
    //    }
    //  });
    //}

    /* set Tags form graph */
    function setTags() {
      if (vm.showTags) {
        switch (vm.showTags) {
          case true:
            vm.showTags = false;
            break;
          case false:
            vm.showTags = true;
            break;
        }
      } else {
        vm.showTags = true;
      }
    };

    /* update Tags form graph */
    function updateTags(tag) {
      vm.showTags = false;
      Metrics.update(vm.metric).success(function (metric) {
        Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, metric.tags, function (updated) {
          if (updated) {
            Dashboards.update(Dashboards.selected).success(function (dashboard) {
              vm.dashboard = Dashboards.selected;
              /* Get tags used in metrics */
              vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
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

    function tagRemoved(tag) {
      if (tag.text === $stateParams.tag) {
        Metrics.update(vm.metric).success(function (metric) {

          /* Update tags in Dashboard if any new are added */
          Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, vm.metric.tags, function (tagsUpdated) {

            if (tagsUpdated) {

              Dashboards.update(Dashboards.selected).success(function (dashboard) {
                vm.dashboard = Dashboards.selected;
                /* Get tags used in metrics */
                vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
              });
            }
          });
          $state.go($state.current, {}, { reload: true });
        });
      }
    };

    function hasFlash() {
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

    /* Zero copied logic */
    function clipClicked() {
      vm.showUrl = false;
    };


  }
}
