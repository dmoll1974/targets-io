'use strict';
angular.module('graphs').controller('GraphsController', [
  '$scope',
  '$modal',
  '$rootScope',
  '$state',
  '$stateParams',
  'Dashboards',
  'Graphite',
  'TestRuns',
  'Metrics',
  '$log',
  'Tags',
  'ConfirmModal',
  'Utils',
  'SideMenu',
  '$timeout',
  function ($scope, $modal, $rootScope, $state, $stateParams, Dashboards, Graphite, TestRuns, Metrics, $log, Tags, ConfirmModal, Utils, SideMenu, $timeout) {



    /* Releative interval options in live graphs */
    //
    //$scope.zoomOptions = [
    //  {value: '-10min' , label: 'Last 10 minutes'},
    //  {value: '-30min' , label: 'Last 30 minutes'},
    //  {value: '-1h', label: 'Last hour'},
    //  {value: '-3h', label: 'Last 3 hours'},
    //  {value: '-6h', label: 'Last 6 hours'},
    //  {value: '-12h', label: 'Last 12 hours'},
    //  {value: '-1d', label: 'Last day'},
    //  {value: '-2d', label: 'Last 2 days'},
    //  {value: '-3d', label: 'Last 3 days'}
    //];
    //
    //
    ///* initiaize menu */
    //
    //var originatorEv;
    //$scope.openMenu = function ($mdOpenMenu, ev) {
    //  originatorEv = ev;
    //  $mdOpenMenu(ev);
    //};
    //
    //
    //
    //$scope.numberOfColumns = Utils.numberOfColumns;
    //$scope.flex = 100 / $scope.numberOfColumns;
    //$scope.showLegend = Utils.showLegend;
    //$scope.showTooltip = Utils.showTooltip;

    //$scope.toggleLegend = function(){
    //
    //  if(Utils.showLegend === true) {
    //    Utils.showLegend = false;
    //  }else {
    //    Utils.showLegend = true;
    //  }
    //}
    //
    //$scope.toggleTooltip = function(){
    //
    //  if(Utils.showTooltip === true) {
    //    Utils.showTooltip = false;
    //  }else {
    //    Utils.showTooltip = true;
    //  }
    //}

    /* watch showLegend*/
    //$scope.$watch(function (scope) {
    //  return Utils.showLegend;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    $scope.showLegend =  Utils.showLegend;
    //  }
    //});

    /* watch showTooltip*/
    //$scope.$watch(function (scope) {
    //  return Utils.showTooltip;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    $scope.showTooltip =  Utils.showTooltip;
    //  }
    //});

    /* watch metricFilter*/
    //$scope.$watch(function (scope) {
    //  return Utils.metricFilter;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    $scope.metricFilter =  Utils.metricFilter;
    //  }
    //});
    //
    //$scope.toggleNumberOfColums = function(numberOfColumns){
    //
    //  switch(numberOfColumns){
    //
    //    case 1:
    //
    //      $scope.numberOfColumns = 1;
    //      $scope.flex = 100 / $scope.numberOfColumns;
    //      Utils.showLegend = true;
    //      break;
    //
    //    case 2:
    //
    //      $scope.numberOfColumns = 2;
    //      $scope.flex = 100 / $scope.numberOfColumns;
    //      Utils.showLegend = true;
    //      break;
    //
    //    case 3:
    //
    //      $scope.numberOfColumns = 3;
    //      $scope.flex = 100 / $scope.numberOfColumns;
    //      Utils.showLegend = false;
    //      break;
    //  }

    //  Utils.numberOfColumns = $scope.numberOfColumns;
    //  $scope.init();
    //
    //}


    //$scope.drilldownToMetric = function(metric){
    //
    //  $scope.metricFilter = metric.alias;
    //  $scope.numberOfColumns = 1;
    //  Utils.numberOfColumns = $scope.numberOfColumns;
    //  $scope.init();
    //}

    //$scope.productName = $stateParams.productName;
    //$scope.dashboardName = $stateParams.dashboardName;
    //
    //$scope.gatlingDetails = $stateParams.tag === 'Gatling' ? true : false;

    ///* Zero copied logic */
    //$scope.clipClicked = function () {
    //  $scope.showViewUrl = false;
    //};

    //$scope.$on('$destroy', function () {
    //  /* reset metricFilter when leaving graphs view */
    //  Utils.metricFilter = '';
    //});

    //$scope.hasFlash = function () {
    //  var hasFlash = false;
    //  try {
    //    var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
    //    if (fo) {
    //      hasFlash = true;
    //      return hasFlash;
    //    }
    //  } catch (e) {
    //    if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
    //      hasFlash = true;
    //      return hasFlash;
    //    }
    //  }
    //};

    ///* Get deeplink params from query string */
    //if ($state.params.zoomFrom)
    //  Utils.zoomFrom = $state.params.zoomFrom;
    //
    //if ($state.params.zoomUntil)
    //  Utils.zoomUntil = $state.params.zoomUntil;
    //
    //if ($state.params.zoomRange){
    //
    //  $scope.selectedZoomOptionIndex = $scope.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf($state.params.zoomRange);
    //
    //
    //  $scope.zoomRange = $scope.zoomOptions[$scope.selectedZoomOptionIndex];
    //
    //
    //}else{
    //  /* get zoom range  */
    //
    //  $scope.zoomRange = Utils.zoomRange;
    //
    //  /* set md-select selected item */
    //
    //  $scope.selectedZoomOptionIndex = $scope.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf($scope.zoomRange.value);
    //
    //}
    //
    //
    //if ($state.params.metricFilter) {
    //    $scope.metricFilter = $state.params.metricFilter;
    //}else{
    //
    //  $scope.metricFilter = Utils.metricFilter;
    //}

    ///* watch metricFilter */
    //$scope.$watch('metricFilter', function (newVal, oldVal) {
    //  if (newVal !== oldVal && (newVal.length > 2 || newVal.length === 0 )) {
    //
    //    //Utils.metricFilter = $scope.metricFilter;
    //
    //    $scope.columnsArray =[];
    //    $scope.filteredMetrics = filteredMetrics($scope.metrics);
    //
    //
    //    var itemsPerColumn = Math.ceil( $scope.filteredMetrics.length / $scope.numberOfColumns);
    //
    //    //Populates the column array
    //    for (var i=0; i< $scope.filteredMetrics.length; i += itemsPerColumn) {
    //      var col = { start: i, end: Math.min(i + itemsPerColumn,  $scope.filteredMetrics.length) };
    //      $scope.columnsArray.push(col);
    //    }
    //
    //    if ($scope.value !== 'All' || $scope.metricFilter !== '') {
    //      _.each($scope.metrics, function (metric, i) {
    //        $scope.metrics[i].isOpen = true;
    //      });
    //    }else{
    //      _.each($scope.metrics, function (metric, i) {
    //        $scope.metrics[i].isOpen = false;
    //      });
    //    }
    //  }
    //});

    //$scope.clearMetricFilter = function(){
    //
    //  $scope.metricFilter = '';
    //
    //};

    //$scope.showViewUrl = false;

    ///* generate deeplink to share view */
    //
    //$scope.setViewShareUrl = function (graphsType) {
    //
    //  switch(graphsType){
    //
    //
    //    case 'graphs-live':
    //      $scope.viewShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?zoomRange=' + Utils.zoomRange.value;
    //      break;
    //    case 'testrun':
    //      $scope.viewShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/';
    //
    //  }
    //
    //  if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter) {
    //    $scope.viewShareUrl = $scope.viewShareUrl + '?';
    //  }
    //  if (Utils.zoomFrom) {
    //    $scope.viewShareUrl = $scope.viewShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
    //  }
    //  if ($state.params.selectedSeries) {
    //    $scope.viewShareUrl = $scope.viewShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
    //  }
    //  if (Utils.metricFilter !== '') {
    //    $scope.viewShareUrl = $scope.viewShareUrl + '&metricFilter=' + encodeURIComponent(Utils.metricFilter)
    //  }
    //
    //  if ($scope.showViewUrl) {
    //    switch ($scope.showViewUrl) {
    //      case true:
    //        $scope.showViewUrl = false;
    //        break;
    //      case false:
    //        $scope.showViewUrl = true;
    //        break;
    //    }
    //  } else {
    //    $scope.showViewUrl = true;
    //  }
    //};
    /* Set product Filter in side menu */
    //SideMenu.productFilter = $stateParams.productName;
    //$scope.$watch('selectedIndex', function (current, old) {
    //  Utils.selectedIndex = current;
    //});

    ///* Get selected series params from query string */
    //
    //TestRuns.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';
    //
    ///* Get metricFilter params from query string */
    //
    //TestRuns.metricFilter = ($state.params.metricFilter) ? decodeURIComponent($state.params.metricFilter) : '';
    //
    //$scope.value = $stateParams.tag;
    /* reset zoom*/
    //$scope.resetZoom = function () {
    //  /*reset zoom*/
    //  Utils.zoomFrom = '';
    //  Utils.zoomUntil = '';
    //  $state.go($state.current, {}, { reload: true });
    //};
    ///* Zoom lock enabled by default */
    //$scope.zoomLock = true;
    //
    /* watch zoomLock */
    //$scope.$watch('zoomLock', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    Utils.zoomLock = newVal;
    //  }
    //});




    //$scope.init = function () {
    //
    //  Dashboards.get($stateParams.productName, $stateParams.dashboardName).then(function (dashboard) {
    //    $scope.dashboard = Dashboards.selected;
    //    $scope.metrics = addAccordionState(Dashboards.selected.metrics);
    //
    //    $scope.columnsArray =[];
    //    $scope.filteredMetrics  = filteredMetrics($scope.metrics);
    //
    //    var itemsPerColumn = Math.ceil( $scope.filteredMetrics.length / $scope.numberOfColumns);
    //
    //    //Populates the column array
    //    for (var i=0; i< $scope.filteredMetrics.length; i += itemsPerColumn) {
    //      var col = { start: i, end: Math.min(i + itemsPerColumn,  $scope.filteredMetrics.length) };
    //      $scope.columnsArray.push(col);
    //    }
    //
    //    /* Get tags used in metrics */
    //    $scope.tags = Tags.setTags($scope.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
    //    /* if reloading a non-existing tag is in $statParams */
    //    $scope.value = checkIfTagExists($stateParams.tag) ? $stateParams.tag : 'All';
    //
    //    /* set the tab index */
    //    setTimeout(function(){
    //
    //      $scope.selectedIndex = Tags.getTagIndex($scope.value, $scope.tags);
    //
    //    });
    //
    //    if ($stateParams.testRunId) {
    //      TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
    //        TestRuns.selected = testRun;
    //        $scope.testRun = testRun;
    //      });
    //    }
    //  });
    //};

    //function filteredMetrics(metrics){
    //
    //  var filteredMetrics = [];
    //  var metricFilterRegExp = new RegExp($scope.metricFilter, 'i');
    //
    //  _.each(metrics, function(metric) {
    //
    //    if (metricFilterRegExp.test(metric.alias) || $scope.metricFilter === '') {
    //      _.each(metric.tags, function (tag) {
    //
    //        if (tag.text === $scope.value) filteredMetrics.push(metric);
    //
    //      });
    //    }
    //    /* if 'ALL' tab is selected show all metrics, except when metricFilter is applied */
    //
    //    if ($scope.value === 'All') {
    //
    //      if ($scope.metricFilter !== '') {
    //
    //        if (metricFilterRegExp.test(metric.alias)) {
    //          filteredMetrics.push(metric)
    //        }
    //
    //      } else {
    //
    //        filteredMetrics.push(metric)
    //      }
    //    }
    //
    //  });
    //
    //  return filteredMetrics;
    //}
    //
    //function checkIfTagExists(tag) {
    //  var exists = false;
    //  _.each($scope.tags, function (existingTag) {
    //    if (tag === existingTag.text) {
    //      exists = true;
    //      return;
    //    }
    //  });
    //  return exists;
    //}
    //function addAccordionState(metrics) {
    //  _.each(metrics, function (metric) {
    //    metric.isOpen = false;
    //  });
    //  return metrics;
    //}


    ///* watch zoomRange */
    //$scope.$watch('zoomRange', function (newVal, oldVal) {
    //  //if (newVal !== oldVal) {
    //    Utils.zoomRange = $scope.zoomRange;
    //  //}
    //});

    
    ///* Set active tab */
    //$scope.isActive = function (tag) {
    //  return $scope.value === tag;
    //};
    //$scope.editMetric = function (metricId) {
    //  $state.go('editMetric', {
    //    productName: $stateParams.productName,
    //    dashboardName: $stateParams.dashboardName,
    //    metricId: metricId
    //  });
    //};
    //$scope.loadTags = function (query) {
    //  var matchedTags = [];
    //  _.each(Dashboards.selected.tags, function (tag) {
    //    if (tag.text.toLowerCase().match(query.toLowerCase()))
    //      matchedTags.push(tag);
    //  });
    //  return matchedTags;
    //};
    //function updateFilterTags(filterTags, filterOperator, persistTag, callback) {
    //  var combinedTag;
    //  var newTags = [];
    //  _.each(filterTags, function (filterTag, index) {
    //    switch (index) {
    //    case 0:
    //      combinedTag = filterTag.text + filterOperator;
    //      break;
    //    case filterTags.length - 1:
    //      combinedTag += filterTag.text;
    //      break;
    //    default:
    //      combinedTag += filterTag.text + filterOperator;
    //    }
    //  });
    //  newTags.push({ text: combinedTag });
    //  Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, newTags, function (tagsUpdated) {
    //    /* if persist tag is checked and tags are updated, update dashboard tags*/
    //    if (tagsUpdated && persistTag) {
    //      Dashboards.update(Dashboards.selected).success(function (dashboard) {
    //        $scope.dashboard = Dashboards.selected;
    //        /* Get tags used in metrics */
    //        //$scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
    //        callback(newTags);
    //      });
    //    } else {
    //      callback(newTags);
    //    }
    //  });
    //}
    //$scope.removeTag = function (removeTag) {
    //  var updatedTags = [];
    //  _.each(Dashboards.selected.tags, function (tag) {
    //    if (tag !== removeTag)
    //      updatedTags.push({ text: tag.text });
    //  });
    //  Dashboards.selected.tags = updatedTags;
    //  Dashboards.update(Dashboards.selected).success(function (dashboard) {
    //  });
    //};
    $scope.openTagsFilterModal = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'tagFilterModal.html',
        controller: 'TagFilterModalInstanceController',
        size: size
      });
      modalInstance.result.then(function (data) {
        updateFilterTags(data.filterTags, data.filterOperator, data.persistTag, function (newTag) {
          /* Get tags used in metrics */
          $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
          $scope.value = newTag[0].text;
          /* set tab index */
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.selectedIndex = Tags.getTagIndex($scope.value, $scope.tags);
            });
          }, 1000);
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  }
]);
