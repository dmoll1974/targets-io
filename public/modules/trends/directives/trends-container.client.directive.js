'use strict';

angular.module('trends').directive('trendsContainer', TrendsContainerDirective);

function TrendsContainerDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/trends/directives/trends-container.client.view.html',
    controller: TrendsContainerDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function TrendsContainerDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, TestRuns, Metrics, Tags, $q, $timeout, Utils, $mdDialog, $window, Trends) {

    var vm = this;


    vm.toggleLegend = toggleLegend;
    vm.toggleTooltip = toggleTooltip;
    //vm.toggleNumberOfColums = toggleNumberOfColums;
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
    //vm.toggleReOrderGraphs = toggleReOrderGraphs;




  /* Watches */


    /* watch trendsZoomRange */
    $scope.$watch('vm.trendsZoomRange', function (newVal, oldVal) {

      if(newVal !== oldVal && newVal !== undefined){

        Utils.trendsZoomRange = vm.trendsZoomRange;
        refresh();
      }



    });

    /* watch zoomLock */
    //$scope.$watch('vm.zoomLock', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    Utils.zoomLock = newVal;
    //  }
    //});

    /* watch zoomLock */
    //$scope.$watch('vm.zoomLock', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    Utils.zoomLock = newVal;
    //  }
    //});


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
        {value: '7' , label: 'Last week'},
        {value: '14' , label: 'Last 2 weeks'},
        {value: '21', label: 'Last 3 weeks'},
        {value: '30', label: 'Last month'},
        {value: '60', label: 'Last 2 months'},
        {value: '90', label: 'Last 3 months'},
        
      ];

      /* Get deeplink params from query string */

      /* If graph has been zoomed */
      if ($state.params.zoomFrom)
        Utils.zoomFrom = $state.params.zoomFrom;

      if ($state.params.zoomUntil)
        Utils.zoomUntil = $state.params.zoomUntil;

      /* get trendsZoomRange for trends*/
      if ($state.params.trendsZoomRange){
        vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf($state.params.trendsZoomRange);
        vm.trendsZoomRange = vm.zoomOptions[vm.selectedZoomOptionIndex];
      }else{
        vm.trendsZoomRange = Utils.trendsZoomRange;
        /* set md-select selected item */
        vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.label;}).indexOf(vm.trendsZoomRange.label);
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

      if ($rootScope.currentState !== $rootScope.previousState && $rootScope.previousState && !$rootScope.previousState.includes('requirementsTestRun') ){

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
      vm.numberOfColumns = 1;
      vm.flex = 100 / vm.numberOfColumns;
      vm.showLegend = Utils.showLegend;
      vm.showTooltip = Utils.showTooltip;
      vm.zoomLock = Utils.zoomLock;
      vm.metricFilter = Utils.metricFilter;
      vm.showViewUrl = false;
      //vm.graphsType =  $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';
      //Utils.graphsType = vm.graphsType;

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


      Trends.getData($stateParams.productName, $stateParams.dashboardName, vm.trendsZoomRange.value).success(function (trends) {


        
        Trends.selected = trends;

        /* Get tags used in metrics */
        vm.tags = Tags.setTags(Trends.selected.metrics, $stateParams.productName, $stateParams.dashboardName, undefined, Trends.selected.tags);

        /* if reloading a non-existing tag is in $statParams */
        vm.value = checkIfTagExists($stateParams.tag) ? $stateParams.tag : 'All';

        vm.metrics = filterOnTag(Trends.selected.metrics);

        vm.filteredMetrics  = vm.metricFilter !=='' ? filterOnMetricFilter(vm.metrics) : vm.metrics;

        populateColumns();

        $timeout(function(){

          vm.selectedIndex = Tags.getTagIndex(vm.value, vm.tags);

        })



        });


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

    //function toggleNumberOfColums(numberOfColumns){
    //
    //  switch(numberOfColumns){
    //
    //    case 1:
    //
    //      vm.numberOfColumns = 1;
    //      vm.flex = 100 / vm.numberOfColumns;
    //      Utils.showLegend = true;
    //      break;
    //
    //    case 2:
    //
    //      vm.numberOfColumns = 2;
    //      vm.flex = 100 / vm.numberOfColumns;
    //      Utils.showLegend = true;
    //      break;
    //
    //    case 3:
    //
    //      vm.numberOfColumns = 3;
    //      vm.flex = 100 / vm.numberOfColumns;
    //      Utils.showLegend = false;
    //      break;
    //  }
    //
    //  Utils.numberOfColumns = vm.numberOfColumns;
    //  refresh();
    //
    //}



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

                  if(tag.index < filteredMetrics[i].tags[tagIndex].index && !insertedItem ){

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


      vm.viewShareUrl = 'http://' + location.host + '/#!/trends/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag;


      /* add trailing ? */
     // if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter || Utils.trendsZoomRange !== '-10min') {
     //   vm.viewShareUrl = vm.viewShareUrl + '?';
     // }
     //
     // /* if graph(s) has been zoomed */
     // if (Utils.zoomFrom && vm.graphsType == 'testrun') {
     //   vm.viewShareUrl = vm.viewShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
     // }
     //
     ///* live graphs zoom range */
     // if (Utils.trendsZoomRange && vm.graphsType == 'graphs-live' && Utils.trendsZoomRange.label !== 'Since start test run')  {
        vm.viewShareUrl = vm.viewShareUrl + '?trendsZoomRange=' + Utils.trendsZoomRange.value;
     // }
     //
     // /* if specific serie hase been selected */
     // if ($state.params.selectedSeries && vm.graphsType == 'testrun') {
     //   vm.viewShareUrl = vm.viewShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
     // }
     //
     // /* if specific metric has been selected */
     // if (vm.metricFilter !== '') {
     //   vm.viewShareUrl = vm.viewShareUrl + '&metricFilter=' + encodeURIComponent(vm.metricFilter);
     // }

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


      $state.go('viewTrends', route);


    };

    //function toggleReOrderGraphs(){
    //
    //  if(vm.reOrderGraphs === false){
    //    _.each(vm.filteredMetrics, function(metric){
    //
    //      metric.isOpen = false;
    //    })
    //
    //    vm.reOrderGraphs = true;
    //
    //  }else{
    //
    //    _.each(vm.filteredMetrics, function(metric){
    //
    //      metric.isOpen = true;
    //
    //    })
    //
    //    vm.reOrderGraphs = false;
    //  }
    //}

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
