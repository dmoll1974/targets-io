'use strict';

angular.module('graphs').directive('graphsContainer', GraphsContainerDirective);

function GraphsContainerDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/graphs/directives/graphs-container.client.view.html',
    controller: GraphsContainerDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function GraphsContainerDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, TestRuns, Metrics, Tags, $q, $timeout, Utils) {

    var vm = this;


    /* Releative interval options in live graphs */
    vm.zoomOptions = [
      {value: '-10min' , label: 'Last 10 minutes'},
      {value: '-30min' , label: 'Last 30 minutes'},
      {value: '-1h', label: 'Last hour'},
      {value: '-3h', label: 'Last 3 hours'},
      {value: '-6h', label: 'Last 6 hours'},
      {value: '-12h', label: 'Last 12 hours'},
      {value: '-1d', label: 'Last day'},
      {value: '-2d', label: 'Last 2 days'},
      {value: '-3d', label: 'Last 3 days'}
    ];

    vm.numberOfColumns = Utils.numberOfColumns;
    vm.flex = 100 / vm.numberOfColumns;
    vm.showLegend = Utils.showLegend;
    vm.showTooltip = Utils.showTooltip;
    vm.zoomLock = Utils.zoomLock;
    vm.metricFilter = Utils.metricFilter;
    vm.showViewUrl = false;
    vm.graphType = $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';


    vm.toggleLegend = toggleLegend;
    vm.toggleTooltip = toggleTooltip;
    vm.toggleNumberOfColums = toggleNumberOfColums;
    vm.isActive = isActive;
    vm.resetZoom = resetZoom;
    vm.clearMetricFilter = clearMetricFilter;
    vm.clipClicked = clipClicked;
    vm.drilldownToMetric = drilldownToMetric;
    vm.setViewShareUrl = setViewShareUrl;
    vm.switchTag = switchTag;


    activate();


    /* initialize menu */

    var originatorEv;
    vm.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.$on('$destroy', function () {
      /* reset metricFilter when leaving graphs view */
      Utils.metricFilter = '';
    });


    ///* watch showLegend*/
    //$scope.$watch(function (scope) {
    //  return Utils.showLegend;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    vm.showLegend =  Utils.showLegend;
    //  }
    //});
    //
    ///* watch showTooltip*/
    //$scope.$watch(function (scope) {
    //  return Utils.showTooltip;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    vm.showTooltip =  Utils.showTooltip;
    //  }
    //});

    /* watch metricFilter */
    $scope.$watch('vm.metricFilter', function (newVal, oldVal) {
      if (newVal &&   newVal !== oldVal && (newVal.length > 2 || newVal.length === 0 )) {

        vm.columnsArray =[];
        vm.filteredMetrics = filteredMetrics(vm.metrics);


        var itemsPerColumn = Math.ceil( vm.filteredMetrics.length / vm.numberOfColumns);

        //Populates the column array
        for (var i=0; i< vm.filteredMetrics.length; i += itemsPerColumn) {
          var col = { start: i, end: Math.min(i + itemsPerColumn,  vm.filteredMetrics.length) };
          vm.columnsArray.push(col);
        }

        /* open or close accordions */
        if (vm.value !== 'All' || vm.metricFilter !== '') {
          _.each(vm.metrics, function (metric, i) {
            vm.metrics[i].isOpen = true;
          });
        }else{
          _.each(vm.metrics, function (metric, i) {
            vm.metrics[i].isOpen = false;
          });
        }
      }
    });


    /* watch metricFilter*/
    $scope.$watch(function (scope) {
      return Utils.metricFilter;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        vm.metricFilter =  Utils.metricFilter;
      }
    });

    /* watch zoomRange */
    $scope.$watch('zoomRange', function (newVal, oldVal) {
      //if (newVal !== oldVal) {
      Utils.zoomRange = vm.zoomRange;
      //}
    });

    /* watch zoomLock */
    $scope.$watch('zoomLock', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        Utils.zoomLock = newVal;
      }
    });

    function activate(){


      /* Get deeplink params from query string */

      /* If graph has been zoomed */
      if ($state.params.zoomFrom)
        Utils.zoomFrom = $state.params.zoomFrom;

      if ($state.params.zoomUntil)
        Utils.zoomUntil = $state.params.zoomUntil;

      /* get zoomRange for live graphs*/
      if ($state.params.zoomRange){
          vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf($state.params.zoomRange);
          vm.zoomRange = vm.zoomOptions[vm.selectedZoomOptionIndex];
      }else{
        vm.zoomRange = Utils.zoomRange;
        /* set md-select selected item */
        vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf(vm.zoomRange.value);
      }

      /* get metricFilter */
      if ($state.params.metricFilter) {
        vm.metricFilter = $state.params.metricFilter;
        Utils.metricFilter = $state.params.metricFilter;
      }else{
        vm.metricFilter = Utils.metricFilter;
      }

       /* get selectedSeries */
      if ($state.params.selectedSeries) {
        vm.selectedSeries = $state.params.selectedSeries;
        Utils.selectedSeries = $state.params.selectedSeries;
      }else{
        vm.selectedSeries = Utils.selectedSeries;
      }

      /* Get selected series params from query string */

      //Utils.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';

      /* Get metricFilter params from query string */

      //Utils.metricFilter = ($state.params.metricFilter) ? decodeURIComponent($state.params.metricFilter) : '';

      /* get value form statParams */
      //vm.value = $stateParams.tag;

      vm.productName = $stateParams.productName;
      vm.dashboardName = $stateParams.dashboardName;

      vm.gatlingDetails = $stateParams.tag === 'Gatling' ? true : false;


      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {



        setTimeout(function(){

        vm.dashboard = Dashboards.selected;
        vm.metrics = addAccordionState(Dashboards.selected.metrics);

        vm.columnsArray =[];
        vm.filteredMetrics  = filteredMetrics(vm.metrics);

        var itemsPerColumn = Math.ceil( vm.filteredMetrics.length / vm.numberOfColumns);

        //Populates the column array
        for (var i=0; i< vm.filteredMetrics.length; i += itemsPerColumn) {
          var col = { start: i, end: Math.min(i + itemsPerColumn,  vm.filteredMetrics.length) };
          vm.columnsArray.push(col);
        }



        /* set the tab index */



          /* Get tags used in metrics */
          vm.tags = Tags.setTags(vm.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);
          /* if reloading a non-existing tag is in $statParams */
          vm.value = checkIfTagExists($stateParams.tag) ? $stateParams.tag : 'All';
          vm.selectedIndex = Tags.getTagIndex(vm.value, vm.tags);

        });

        if ($stateParams.testRunId) {
          TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
            TestRuns.selected = testRun;
            vm.testRun = testRun;
          });
        }
      });

    }


    /* Set active tab */
    function isActive(tag) {
      return vm.value === tag;
    };

    function toggleNumberOfColums(numberOfColumns){

      switch(numberOfColumns){

        case 1:

          vm.numberOfColumns = 1;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = true;
          break;

        case 2:

          vm.numberOfColumns = 2;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = true;
          break;

        case 3:

          vm.numberOfColumns = 3;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = false;
          break;
      }

      Utils.numberOfColumns = vm.numberOfColumns;
      activate();

    }



    function toggleLegend(){

      if(vm.showLegend === true) {
        vm.showLegend = false;
        Utils.showLegend = false;
      }else {
        vm.showLegend = true;
        Utils.showLegend = true;
      }
    }

    function toggleTooltip(){

      if(vm.showTooltip === true) {
        vm.showTooltip = false;
        Utils.showTooltip = false;
      }else {
        vm.showTooltip = true;
        Utils.showTooltip = true;
      }
    }

    function filteredMetrics(metrics){

      var filteredMetrics = [];
      var metricFilterRegExp = new RegExp(vm.metricFilter, 'i');

      _.each(metrics, function(metric) {

        if (metricFilterRegExp.test(metric.alias) || vm.metricFilter === '') {
          _.each(metric.tags, function (tag) {

            if (tag.text === vm.value) filteredMetrics.push(metric);

          });
        }
        /* if 'ALL' tab is selected show all metrics, except when metricFilter is applied */

        if (vm.value === 'All') {

          if (vm.metricFilter !== '') {

            if (metricFilterRegExp.test(metric.alias)) {
              filteredMetrics.push(metric)
            }

          } else {

            filteredMetrics.push(metric)
          }
        }

      });

      return filteredMetrics;
    }

    function checkIfTagExists(tag) {
      var exists = false;
      _.each(vm.tags, function (existingTag) {
        if (tag === existingTag.text) {
          exists = true;
          return;
        }
      });
      return exists;
    }
    function addAccordionState(metrics) {
      _.each(metrics, function (metric) {
        metric.isOpen = false;
      });
      return metrics;
    }

    function resetZoom() {
      /*reset zoom*/
      Utils.zoomFrom = '';
      Utils.zoomUntil = '';
      //$state.go($state.current, {}, { reload: true });
    };

    function clearMetricFilter (){

      vm.metricFilter = '';

    };

    
    /* generate deeplink to share view */

    function setViewShareUrl(graphsType) {

      switch(graphsType){

        case 'graphs-live':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?zoomRange=' + Utils.zoomRange.value;
          break;
        case 'testrun':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/';

      }

      /* add trailing ? */
      if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter || Utils.zoomRange !== '-10min') {
        vm.viewShareUrl = vm.viewShareUrl + '?';
      }
      
      /* if graph(s) has been zoomed */
      if (Utils.zoomFrom && graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }

     /* live graphs zoom range */
      if (Utils.zoomRange && graphsType == 'graphs-live') {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomRange=' + Utils.zoomRange;
      }

      /* if specific serie hase been selected */
      if ($state.params.selectedSeries && graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
      }

      /* if specific metric has been selected */
      if (Utils.metricFilter !== '') {
        vm.viewShareUrl = vm.viewShareUrl + '&metricFilter=' + encodeURIComponent(Utils.metricFilter)
      }

      if (vm.showViewUrl) {
        switch (vm.showViewUrl) {
          case true:
            vm.showViewUrl = false;
            break;
          case false:
            vm.showViewUrl = true;
            break;
        }
      } else {
        vm.showViewUrl = true;
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
      vm.showViewUrl = false;
    };

    function drilldownToMetric(metric){

      vm.metricFilter = metric.alias;
      vm.numberOfColumns = 1;
      Utils.numberOfColumns = vm.numberOfColumns;
      activate();
    }

    function switchTag(tag) {

      switch(vm.graphType){

        case 'testrun':

          $state.go('viewGraphs', {
            'productName': vm.productName,
            'dashboardName': vm.dashboardName,
            'testRunId': vm.testRun.testRunId,
            'tag': tag
          });
          break;

        case 'graphs-live':

          $state.go('viewLiveGraphs', {
            'productName': vm.productName,
            'dashboardName': vm.dashboardName,
            'tag': tag
          });


      }
    };
  }
}
