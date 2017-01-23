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
  function GraphsContainerDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, TestRuns, Metrics, Tags, $q, $timeout, Utils, $mdDialog, $window) {

    var vm = this;


    vm.toggleLegend = toggleLegend;
    vm.toggleTooltip = toggleTooltip;
    vm.toggleNumberOfColums = toggleNumberOfColums;
    vm.isActive = isActive;
    vm.resetZoom = resetZoom;
    vm.hasFlash = hasFlash;
    vm.clipClicked =clipClicked;
    vm.drilldownToMetric = drilldownToMetric;
    vm.setViewShareUrl = setViewShareUrl;
    vm.switchTag = switchTag;
    vm.setMetricFilter = setMetricFilter;
    vm.clearMetricFilter = clearMetricFilter;
    vm.openMenu = openMenu;
    vm.showAnnotations = showAnnotations;
    vm.toggleReOrderGraphs = toggleReOrderGraphs;




  /* Watches */


    /* watch zoomRange */
    $scope.$watch('vm.zoomRange', function (newVal, oldVal) {

        Utils.zoomRange = vm.zoomRange;

    });

    /* watch zoomLock */
    $scope.$watch('vm.zoomLock', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        Utils.zoomLock = newVal;
      }
    });

    /* watch zoomLock */
    $scope.$watch('vm.zoomLock', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        Utils.zoomLock = newVal;
      }
    });


    $scope.$on('$destroy', function () {
      /* reset metricFilter when leaving graphs view */
      Utils.metricFilter = '';
      Utils.showTooltip = false;
      Utils.selectedSeries = '';

    });

    /* activate */

    activate();


    /* functions */


    function activate(){


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
        vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.label;}).indexOf(vm.zoomRange.label);
      }

      /* get metricFilter */
      if ($state.params.metricFilter) {
        vm.metricFilter = $state.params.metricFilter;
        vm.metricFilterInput = $state.params.metricFilter;
        Utils.metricFilter = $state.params.metricFilter;
      }else{
        vm.metricFilter = Utils.metricFilter;
        vm.metricFilterInput = Utils.metricFilter;
      }

      /* get selectedSeries */
      if ($state.params.selectedSeries) {
        vm.selectedSeries = $state.params.selectedSeries;
        Utils.selectedSeries = $state.params.selectedSeries;
      }else{
        vm.selectedSeries = Utils.selectedSeries;
      }

      /* reset Utils if not navigating the tabs */

      if ($rootScope.currentState !== $rootScope.previousState && $rootScope.previousState && !$rootScope.previousState.indexOf('requirementsTestRun') >= 0 ){

        Utils.reset();
      }

      /* Get selected series params from query string */

      //Utils.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';

      /* Get metricFilter params from query string */

      //Utils.metricFilter = ($state.params.metricFilter) ? decodeURIComponent($state.params.metricFilter) : '';

      /* get value form statParams */
      //vm.value = $stateParams.tag;

      vm.productName = $stateParams.productName;
      vm.dashboardName = $stateParams.dashboardName;
      vm.tag = $stateParams.tag;

      vm.gatlingDetails = $stateParams.tag === 'Gatling' ? true : false;

      vm.graphsLiveBreadcrumpSize = $window.innerWidth * 0.025;


      //vm.value = $stateParams.tag;
      vm.numberOfColumns = Utils.numberOfColumns;
      vm.flex = 100 / vm.numberOfColumns;
      vm.showLegend = Utils.showLegend;
      vm.showTooltip = Utils.showTooltip;
      vm.zoomLock = Utils.zoomLock;
      vm.metricFilter = Utils.metricFilter;
      vm.showViewUrl = false;
      vm.graphsType =  $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';
      Utils.graphsType = vm.graphsType;

      vm.dragControlListeners = {
        //accept: vm.enableReOrder,
        itemMoved: updateMetricOrder,
        orderChanged: updateMetricOrder,

      };

      vm.reOrderGraphs = false;

      refresh();

    }

    /* initialize menu */

    var originatorEv;
    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };


    function refresh(){

      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {


        vm.dashboard = Dashboards.selected;

        /* Get tags used in metrics */
        vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

        /* if reloading a non-existing tag is in $statParams */
        vm.value = checkIfTagExists($stateParams.tag) ? $stateParams.tag : 'All';

        vm.metrics = filterOnTag(Dashboards.selected.metrics);

        vm.filteredMetrics  = vm.metricFilter !=='' ? filterOnMetricFilter(vm.metrics) : vm.metrics;

        populateColumns();

        $timeout(function(){

          vm.selectedIndex = Tags.getTagIndex(vm.value, vm.tags);

        },250)


        if ($stateParams.testRunId) {
          TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
            TestRuns.selected = testRun;

            /* Get tags used in metrics */
            vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

            /* if breadcrump is too long, crop it ...*/

            var breadCrumpLength = $stateParams.productName.length + $stateParams.dashboardName.length + testRun.testRunId.length;
            testRun.testRunIdBreadCrump = ( breadCrumpLength < 60)? testRun.testRunId : testRun.testRunId.substring(0,(60-($stateParams.productName.length + $stateParams.dashboardName.length))) + '...';

            vm.testRun = testRun;
          });
        }
      });

      if(vm.graphsType === 'graphs-live'){

        TestRuns.getRunningTest($stateParams.productName, $stateParams.dashboardName).success(function(runningTest) {

          if (runningTest.start && !$state.params.zoomRange) {

            vm.runningTest = runningTest;

            var runningTestBreadCrumpLength = $stateParams.productName.length + $stateParams.dashboardName.length + runningTest.testRunId.length;

            vm.runningTest.testRunIdBreadCrump = ( runningTestBreadCrumpLength < vm.graphsLiveBreadcrumpSize)? runningTest.testRunId : runningTest.testRunId.substring(0,(vm.graphsLiveBreadcrumpSize-($stateParams.productName.length + $stateParams.dashboardName.length))) + '...';


            var runningTestOption = {};
            runningTestOption.value = new Date(runningTest.start).getTime();
            runningTestOption.label = 'Since start test run';

            vm.zoomOptions.unshift(runningTestOption);

            Utils.zoomRange = Utils.zoomRange.label === 'Since start test run' ? runningTestOption : Utils.zoomRange;

            vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf(Utils.zoomRange.value);

          }else{

            if(!$state.params.zoomRange){ /* if zoomRange is not provided via query string, set it to 'Last 10 minutes'*/

              Utils.zoomRange = {
                value: '-10min',
                label: 'Last 10 minutes'
              };
            }


            vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf(Utils.zoomRange.value);


          }
        });
      }

    }

    function updateMetricOrder(event){

      var concattedColumns = [];
      var columnOffset = 0;

      _.each(vm.columnsArray, function(column){

        _.each(column.filteredMetrics, function(metric, i){

          var updateTagIndex = metric.tags.map(function(tag){return tag.text;}).indexOf($state.params.tag);

          metric.tags[updateTagIndex].index = i + columnOffset;

          Metrics.update(metric).success(function(){

          })

        })

        columnOffset = column.filteredMetrics.length;
        concattedColumns = concattedColumns.concat(column.filteredMetrics);

      })

      vm.filteredMetrics = concattedColumns;

      populateColumns();
    }



    function populateColumns(){


      vm.columnsArray = [];

      var numberOfItemsPerColumn = Math.ceil(vm.filteredMetrics.length / vm.numberOfColumns);

      var itemsPerColumn = [];


      for (var i = 0; i < vm.filteredMetrics.length; i++) {

        if(i !== 0 && i % numberOfItemsPerColumn === 0  ){

          vm.columnsArray.push({filteredMetrics: itemsPerColumn });
          itemsPerColumn = [];

        }


        itemsPerColumn.push(vm.filteredMetrics[i]);

      }

      vm.columnsArray.push({filteredMetrics: itemsPerColumn });



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
      refresh();

    }



    function toggleLegend(){

      if(vm.showLegend === true) {
        Utils.showLegend = true;
      }else {
        Utils.showLegend = false;
      }
    }

    function toggleTooltip(){

      if(vm.showTooltip === true) {
        Utils.showTooltip = true;
      }else {
        Utils.showTooltip = false;
      }
    }

    function filterOnMetricFilter(metrics){

      if (vm.metricFilter === ''){

        return metrics;

      }else {
        var filteredMetrics = [];
        var metricFilterRegExp = new RegExp(vm.metricFilter, 'i');


        _.each(metrics, function (metric) {

          /* see if alias matches metricFilter */
          if (metricFilterRegExp.test(metric.alias)) {

            metric.isOpen = true;
            filteredMetrics.push(metric);

          } else {
            /* if not, check if tags match*/
            for (var i = 0; i < metric.tags.length; i++) {

              if (metricFilterRegExp.test(metric.tags[i].text)) {
                metric.isOpen = true;
                filteredMetrics.push(metric);
                break;
              }

            }
          }

        });

        return filteredMetrics;
      }
    }

    function setMetricFilter(){

      vm.metricFilter = vm.metricFilterInput;
      refresh();



    }

    function clearMetricFilter (){

      vm.metricFilter = '';
      vm.metricFilterInput = '';
      refresh();
    };

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

    function filterOnTag(metrics) {

      var filteredMetrics = [];


      _.each(metrics, function(metric) {

        /* if tab is 'All', don't filter, but don't show the graphs */

        if(vm.value === 'All'){

          metric.isOpen = false;
          filteredMetrics.push(metric)

        }else{

          _.each(metric.tags, function (tag) {

            if (tag.text === vm.value) {

              metric.isOpen = true;



              if (filteredMetrics.length === 0){
                filteredMetrics.push(metric);
              }else{

                var insertedItem = false;

                var tagIndex = metric.tags.map(function(tag){return tag.text;}).indexOf($state.params.tag);

                _.each(filteredMetrics, function(filteredMetric, i){

                  var filteredMetricTagIndex = filteredMetric.tags.map(function(tag){return tag.text;}).indexOf($state.params.tag);


                  if(tag.index < filteredMetric.tags[filteredMetricTagIndex].index && !insertedItem ){

                    filteredMetrics.splice(i, 0, metric);
                    insertedItem = true;


                  }


                })

                if(!insertedItem)  filteredMetrics.push(metric);
                //var tagIndex = metric.tags.map(function(tag){return tag.text;}).indexOf($state.params.tag);
                //
                //if(tag.index > filteredMetrics[filteredMetrics.length - 1].tags[tagIndex].index){
                //
                //  filteredMetrics.push(metric);
                //
                //}else{
                //
                //  filteredMetrics.splice(index, 0, item)
                //    filteredMetrics.unshift(metric);
                //}

                //filteredMetrics.splice(tag.index, 0, metric);
              }

            }

          });
        }


      });

      return filteredMetrics;
    }

    function resetZoom() {
      /*reset zoom*/
      Utils.zoomFrom = '';
      Utils.zoomUntil = '';
      refresh();
      //$state.go($state.current, {}, { reload: true });
    };


    
    /* generate deeplink to share view */

    function setViewShareUrl() {

      switch(vm.graphsType){

        case 'graphs-live':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/';
          break;
        case 'testrun':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/';

      }

      /* add trailing ? */
      if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter || Utils.zoomRange !== '-10min') {
        vm.viewShareUrl = vm.viewShareUrl + '?';
      }
      
      /* if graph(s) has been zoomed */
      if (Utils.zoomFrom && vm.graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }

     /* live graphs zoom range */
      if (Utils.zoomRange && vm.graphsType == 'graphs-live' && Utils.zoomRange.label !== 'Since start test run')  {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomRange=' + Utils.zoomRange.value;
      }

      /* if specific serie hase been selected */
      if ($state.params.selectedSeries && vm.graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
      }

      /* if specific metric has been selected */
      if (vm.metricFilter !== '') {
        vm.viewShareUrl = vm.viewShareUrl + '&metricFilter=' + encodeURIComponent(vm.metricFilter);
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
      refresh();
    }

    function switchTag(route) {

      Utils.metricFilter = '';

      Utils.showTooltip = false;

      switch(vm.graphsType){

        case 'testrun':

          route.testRunId = vm.testRun.testRunId;

          $state.go('viewGraphs', route);

          break;

        case 'graphs-live':

          $state.go('viewLiveGraphs', route);


      }
    };

    function toggleReOrderGraphs(){

      if(vm.reOrderGraphs === false){
        _.each(vm.filteredMetrics, function(metric){

          metric.isOpen = false;
        })

        vm.reOrderGraphs = true;

      }else{

        _.each(vm.filteredMetrics, function(metric){

          metric.isOpen = true;

        })

        vm.reOrderGraphs = false;
      }
    }

    function showAnnotations($event, testRun, runningTest) {

      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl: 'modules/testruns/views/testrun.annotations.client.view.html',
        locals: {
          testRun: testRun
        },
        controller: DialogController
      });
      function DialogController($scope, $mdDialog, testRun, TestRuns) {
        $scope.testRun = testRun;

        $scope.cancel = function(){

          $mdDialog.hide();

        }

        $scope.closeDialog = function () {

          if(runningTest){

            TestRuns.updateRunningTestAnnotations($scope.testRun).success(function () {

              $mdDialog.hide();

            }, function(){

              var toast = $mdToast.simple()
                  .action('OK')
                  .highlightAction(true)
                  .hideDelay(3000)

              $mdToast.show(toast.content('Something went wrong saving test run annotations!')).then(function (response) {
              })

              $mdDialog.hide();

            });

          }else{

            TestRuns.update(testRun).success(function () {

              $mdDialog.hide();
            }, function(){

              var toast = $mdToast.simple()
                  .action('OK')
                  .highlightAction(true)
                  .hideDelay(3000)

              $mdToast.show(toast.content('Something went wrong saving test run annotations!')).then(function (response) {
              })

              $mdDialog.hide();

            });

          }
        }
      }

    }
  }
}
