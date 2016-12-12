'use strict';

angular.module('graphs').directive('dygraph', DygraphDirective);

/* @ngInject */
function DygraphDirective ($timeout, Interval, TestRuns, Utils) {

  var directive = {

    restrict: 'E',
    scope: {
      metric: '=',
      index: '='
     },
    //template: '<div flex class="dygraph-div"  style="width:100%;"><legend legend="legend" style="margin-top: 20px; margin-left: 30px;"></legend>',
    templateUrl: 'modules/graphs/directives/dygraph.client.view.html',
    controller: DygraphController,
    //
    link: function(scope, elem, attrs) {

      scope.$watch('loading', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal !== true) {


          /* if no data , set title to 'No data available'*/

          if(scope.metric.graphNumberOfValidDatapoints === 0){

            if(scope.data.length > 0){

              scope.opts.title = 'No data available';
            }else {
              scope.data = 'X\n';
              scope.opts.title = 'Error, check your Graphite query';
            }
          }




          scope.graph = new Dygraph(elem.children()[0], scope.data, scope.opts);


          scope.graph.ready(function() {

            /* if selected series is provided (via deeplink), show this series only */
            if (Utils.selectedSeries && Utils.selectedSeries !== '' && Utils.metricFilter === scope.metric.alias) {

              /* show / hide selected series in legend */

              _.each(scope.metric.legendData, function (legendItem, i) {

                if(legendItem.name !== Utils.selectedSeries)
                  scope.graph.setVisibility(legendItem.id, false);

              })

            }

            /* if selected series have been set via the legend, set them again after reload or zoom */
            if(scope.selectedSeries){


                _.each(scope.metric.legendData, function (legendItem, i) {
                  _.each(scope.selectedSeries, function (series) {

                    if(legendItem.name === series.name)
                      scope.metric.legendData[i].visible = series.visible;

                  })
                })

                _.each(scope.metric.legendData, function (legendItem, i) {

                  scope.graph.setVisibility(legendItem.id, legendItem.visible);

                })

            }

            /* set y-axis range depending on zoom action*/

              var yRange = (scope.horizontalZoom) ? [0, getMaximumOfSelectedSeries(scope.metric.legendData)] : scope.zoomedYRange;
              scope.graph.updateOptions({
                valueRange: yRange
            });



            /* add colors to legend */

            $timeout(function(){
              var colors = scope.graph.getColors();

              _.each(scope.metric.legendData, function(legendItem, i){

                if(scope.metric.legendData[i].numberOfValidDatapoints > 0 ){

                  scope.metric.legendData[i].color = colors[i];

                }

              })
            });
            /* add annotation to graph */
            var annotations = scope.graph.annotations();

            _.each(scope.metric.annotations, function(annotationFromEvent){

              annotations.push(annotationFromEvent);

            })
            scope.graph.setAnnotations(annotations);


          });

         
        }

      });

      function getMaximumOfSelectedSeries(legendData){

        var maxValue = 0;

        _.each(legendData, function(legendItem){

          if(legendItem.visible === true && legendItem.max > maxValue ) maxValue = legendItem.max;
        })

        return maxValue;
      }

    }
  };

  return directive;

  /* @ngInject */
  function DygraphController($scope, $state, $stateParams, $rootScope, $timeout, TestRuns, Graphite, Events, Utils) {

    var clickDetected = false;

    $scope.highlightSeries = highlightSeries;
    $scope.updateSelectedSeries = updateSelectedSeries;
    $scope.setAllSeriesSelected = setAllSeriesSelected;
    $scope.selectSeriesToggle = selectSeriesToggle;
    $scope.selectOtherSeriesToggle = selectOtherSeriesToggle;

    /* activate */

    activate();


      /* watches */

    /* watch zoomLock */

    $scope.$watch(function (scope) {
      return Utils.zoomLock;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        $scope.zoomLock =  Utils.zoomLock;
      }
    });

    /* toggle showLegend*/
    $scope.$watch(function (scope) {
      return Utils.showLegend;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        $scope.showLegend =  Utils.showLegend;
      }
    });

    /* watch zoomRange */
    $scope.$watch(function (scope) {
      return Utils.zoomRange;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        Interval.clearAll();

        $scope.zoomRange =  Utils.zoomRange;

        $scope.showProgressBar = true;

        drawDypraph($scope.graphsType);
      }
    });

    /* watch showTooltip */
    $scope.$watch(function (scope) {
      return Utils.showTooltip;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

        $scope.showTooltip = newVal;
        $scope.graph.updateOptions({legend: Utils.showTooltip ? 'onmouseover' : 'never'});

      }
    });

    /* If zoom lock is checked, update all graphs when zoom is applied in one */
    $scope.$watch(function (scope) {
      return Utils.zoomFrom;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.zoomLock === true) {

        $scope.showProgressBar = true;

        drawDypraph($scope.graphsType);

      }
    });

    /* stop data polling when accordion is closed */
    $scope.$watch('metric.isOpen', function (newVal, oldVal) {
      //if (newVal !== oldVal) {
      if(newVal === false) {
        Interval.clearIntervalForMetric($scope.metric._id);
      }else{
        $scope.showProgressBar = true;
        drawDypraph($scope.graphsType);
      }
      //}

    });
    /* stop data polling when element is destroyed by ng-if */

    $scope.$on('$destroy', function () {
      Interval.clearIntervalForMetric($scope.metric._id);
    /* Explicitly destroy the graph */
      $scope.graph.destroy();

    });




    /* functions */

    function activate() {

      $scope.selectAll = true;
      $scope.showLegend = Utils.showLegend;
      $scope.horizontalZoom = true;


      /* set zoomLock */

      $scope.zoomLock = Utils.zoomLock;

      setTimeout(function(){

        $scope.graphsType =  Utils.graphsType;
        $scope.showProgressBar = true;

        drawDypraph($scope.graphsType);

      });


    }



    function drawDypraph(graphsType)  {

      $scope.loading = true;

      switch(graphsType){

        case 'testrun':

          TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
            TestRuns.selected = testRun;
            var from = Utils.zoomFrom ? Utils.zoomFrom : TestRuns.selected.startEpoch;
            var until = Utils.zoomUntil ? Utils.zoomUntil : TestRuns.selected.endEpoch;

            processGraph(from, until);

          });

          break;

        case 'graphs-live':

          $scope.zoomRange =  Utils.zoomRange;
            
          var from = Utils.zoomFrom ? Utils.zoomFrom : $scope.zoomRange.value;
          var until = Utils.zoomUntil ? Utils.zoomUntil : 'now';

          processGraph(from, until);

          break;
      }

      function processGraph(from, until)
      {

        updateGraph(from, until, $scope.metric.targets, function (dygraphData) {

          $scope.opts = {
            connectSeparatedPoints: true,
            labels: dygraphData.labels,
            axisLabelFontSize: 12,
            legend: Utils.showTooltip ? 'onmouseover' : 'never',
            labelsDiv: document.getElementById("legend-" + $scope.index),
            includeZero: true,
            valueRange: $scope.yRange,
            highlightCircleSize: 0,
            highlightSeriesOpts: {
              strokeWidth: 2
            },
            ylabel: $scope.metric.unit !== 'None'? $scope.metric.unit : '' ,
            yLabelWidth: 14,
            highlightCallback: highLightLegend,
            unhighlightCallback: unHighLightLegend,
            axes: {
              x: {
                axisLabelFormatter: Dygraph.dateAxisLabelFormatter,
                //valueFormatter: Dygraph.dateString_
                valueFormatter: function(ms) {
                  return formatDate(new Date(ms));
                }
              }
            },
            underlayCallback: createUnderlayFormEvents,
            clickCallback: createEventFromClick,
            zoomCallback: zoomGraph
          };


          function formatDate(d) {
            var yyyy = d.getFullYear(),
                mm = d.getMonth() + 1,
                dd = d.getDate(),
                hh = d.getHours(),
                MM = d.getMinutes(),
                ss = d.getSeconds();

            return (dd < 10 ? '0' : '') + dd + '-' + (mm < 10 ? '0' : '') + mm +  '-' + yyyy + ' ' + (hh < 10 ? '0' : '') + hh +  ':' + (MM < 10 ? '0' : '') + MM +  ':' + (ss < 10 ? '0' : '') + ss  ;
          }

          /* reset data first */


          $scope.data = null;
          $scope.metric.legendData = null;


          $scope.data = dygraphData.data;
          $scope.metric.legendData = dygraphData.legendData;
          $scope.yRange = ($scope.zoomedYRange) ? $scope.zoomedYRange : [0,dygraphData.maxValue ];

          /* synchronyze anotations with datapoints */

          _.each(dygraphData.annotations, function (annotation) {

            annotation = synchronizeWithDataPoint(annotation);
          })


          $scope.metric.annotations = dygraphData.annotations;
          $scope.metric.graphNumberOfValidDatapoints = dygraphData.graphNumberOfValidDatapoints;

          $scope.loading = false;
          $scope.showProgressBar = false;

          /* if selected series is provided, show this series only */
          if (Utils.selectedSeries && Utils.selectedSeries !== '' && Utils.metricFilter === $scope.metric.alias) {

            $scope.selectAll = false;

              _.each($scope.metric.legendData, function(legendItem, i){

                if(legendItem.name === Utils.selectedSeries ) {

                  $scope.metric.legendData[i].visible = true;

                }else{

                  $scope.metric.legendData[i].visible = false;

                }

              })


          }

          /* in case of live graphs set interval */
          if($scope.graphsType === 'graphs-live' &&  Interval.active.map(function(interval){return interval.metricId}).indexOf($scope.metric._id) === -1){

            var intervalId = setInterval(function () {

              drawDypraph($scope.graphsType);

            }, 10000);

            Interval.active.push({
              intervalId: intervalId,
              metricId: $scope.metric._id
            });

            /* if zoomrange execeeds 3h, don't update graph due to bad performance*/

            if($scope.zoomRange.value === '-6h' || $scope.zoomRange.value === '-12h' || $scope.zoomRange.value === '-1d' || $scope.zoomRange.value === '-2d' || $scope.zoomRange.value === '-3d' || ($scope.zoomRange.label === 'Since start test run' && new Date().getTime() - $scope.zoomRange.value * 1000 > 3 * 60 * 60 * 1000 * 1000)){
              Interval.clearAll();
            }

          }
        });

      }


    }

    function createUnderlayFormEvents  (canvas, area, g) {
      if($scope.data.length > 0) {
        /* get full range of graph to determine width of underlay */
        var xAxisRange = new Date($scope.data[$scope.data.length - 1][0]).getTime() - new Date($scope.data[0][0]).getTime();
        _.each($scope.metric.annotations, function (annotation) {
          var bottom_left = g.toDomCoords(annotation.x, -20);
          var top_right = g.toDomCoords(annotation.x + (xAxisRange / 800), +20);

          var left = bottom_left[0];
          var right = top_right[0];

          canvas.fillStyle = "#FF5722";
          canvas.fillRect(left, area.y, right - left, area.h);
        })
      }
    }

    function createEventFromClick  (e, x, points) {

      if (clickDetected) {

        clickDetected = false;
        var eventTimestamp = new Date(x).toISOString();
        Events.selected.productName = $stateParams.productName;
        Events.selected.dashboardName = $stateParams.dashboardName;
        Events.selected.eventTimestamp = eventTimestamp;
        Events.selected.eventDescription = '';
        Events.selected.testRunId = $stateParams.testRunId;


        ///* in case of live graphs, try to get running test testRunId*/
        if($scope.graphsType === 'graphs-live') {

          TestRuns.listRunningTestsForDashboard($stateParams.productName, $stateParams.dashboardName, 1).success(function (runningTest) {

           if(runningTest[0])Events.selected.testRunId = runningTest[0].testRunId;

            $state.go('createEvent', {
              productName: $stateParams.productName,
              dashboardName: $stateParams.dashboardName
            });

          })
        }else{

          $state.go('createEvent', {
            productName: $stateParams.productName,
            dashboardName: $stateParams.dashboardName
          });

        }


      } else {
        clickDetected = true;
        setTimeout(function () {
          clickDetected = false;
        }, 500);
      }
    }

    function zoomGraph(minDate, maxDate, yRange){

      var fromBeforeZoom = (Utils.zoomFrom) ? Utils.zoomFrom : TestRuns.selected.startEpoch;
      var untilBeforeZoom = (Utils.zoomUntil) ? Utils.zoomUntil : TestRuns.selected.endEpoch;

      /* determine if horizontalZoom has been done*/

      $scope.horizontalZoom = ((maxDate - minDate)/(untilBeforeZoom - fromBeforeZoom)) > 0.99 ? false : true;


      Utils.zoomFrom = Math.round(minDate);
      Utils.zoomUntil= Math.round(maxDate);
      $scope.zoomedYRange = [Math.round(yRange[0][0]),Math.round(yRange[0][1])];
       drawDypraph($scope.graphsType);
    }



    function synchronizeWithDataPoint (annotationFromEvent){

      var synchronizedAnnotationTimestamp = annotationFromEvent ;

      for(var i=0;i < $scope.data.length; i++){

        if(new Date($scope.data[i][0]).getTime() > annotationFromEvent.x){

          synchronizedAnnotationTimestamp.x = new Date($scope.data[i][0]).getTime();
          break;
        }
      }

      return synchronizedAnnotationTimestamp;
    }

    var unHighLightLegend = function(event){

      $scope.$apply(function () {
        _.each($scope.metric.legendData, function(legendItem, i){

            $scope.metric.legendData[i].highlighted = false;
        })
      });
    }
    var highLightLegend = function(event, x, points, row, seriesName){

       var hightLightedIndex = $scope.metric.legendData.map(function(legendItem){
         return legendItem.name;
       }).indexOf(seriesName);


      $scope.$apply(function () {
        _.each($scope.metric.legendData, function(legendItem, i){

         if(i === hightLightedIndex){

           $scope.metric.legendData[i].highlighted = true;

         }else{

           $scope.metric.legendData[i].highlighted = false;
         }
       })
      });
    }

    function highlightSeries(seriesName){

      $scope.graph.setSelection(false, seriesName)
    }

    function updateGraph(from, until, targets, callback) {
      Graphite.getData(from, until, targets, 900).then(function (series) {
        if (series.data.length > 0) {
          Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).then(function (seriesEvents) {
            callback(seriesEvents);
          });
        } else {
          callback(series);
        }
      });
    }



    function updateSelectedSeries() {

      /* show / hide selected series in legend */
      setTimeout(function(){

        _.each($scope.metric.legendData, function(legendItem, i){

            $scope.graph.setVisibility(legendItem.id, legendItem.visible);

        })

        /* set y-axis range to highest of the selected series */

        var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
        $scope.graph.updateOptions({
          valueRange: [0,maxValue ]
        });

        $scope.selectAll = false;

        /* save series visibilty to apply after zoom or live reload */
        saveSeriesVisibility($scope.metric.legendData);

      });
    }

    function setAllSeriesSelected(setAllSeriesTo){

      _.each($scope.metric.legendData, function(legendItem, i){

        legendItem.visible = setAllSeriesTo;

        $scope.graph.setVisibility(legendItem.id, legendItem.visible);
      })

      /* set y-axis range to highest of the selected series */

      var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
      $scope.graph.updateOptions({
        valueRange: [0,maxValue ]
      });

      $scope.selectAll = false;

      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);

    };

    function selectSeriesToggle(selectedLegendItem){

      var selectedSeriesIndex = $scope.metric.legendData.map(function(legendItem){return legendItem.id;}).indexOf(selectedLegendItem.id);

      if (selectedLegendItem.visible === true){

        $scope.metric.legendData[selectedSeriesIndex].visible = false;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);

      }else{

        $scope.metric.legendData[selectedSeriesIndex].visible = true;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);
      }

      /* set y-axis range to highest of the selected series */

      var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
      $scope.graph.updateOptions({
        valueRange: [0,maxValue ]
      });

      $scope.selectAll = false;

      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);

    }

    function saveSeriesVisibility(legendData){

      var selectedSeries = [];

      _.each(legendData, function(legendItem){

          selectedSeries.push({name: legendItem.name, visible: legendItem.visible});
      })

      $scope.selectedSeries = selectedSeries;

    };

    function selectOtherSeriesToggle(selectedLegendItem){

      var selectedSeriesIndex = $scope.metric.legendData.map(function(legendItem){return legendItem.id;}).indexOf(selectedLegendItem.id);

      //if (selectedLegendItem.visible === true) {

        $scope.metric.legendData[selectedSeriesIndex].visible = true;
        $scope.graph.setVisibility($scope.metric.legendData[selectedSeriesIndex].id, $scope.metric.legendData[selectedSeriesIndex].visible);

        _.each($scope.metric.legendData, function (legendItem, i) {

          if (legendItem.id !== selectedLegendItem.id) {

            $scope.metric.legendData[i].visible = false;
            $scope.graph.setVisibility($scope.metric.legendData[i].id, $scope.metric.legendData[i].visible);

          }
        });

        /* set y-axis range to highest of the selected series */

        var maxValue = getMaximumOfSelectedSeries($scope.metric.legendData);
        $scope.graph.updateOptions({
          valueRange: [0, maxValue]
        });

      $scope.selectAll = false;


      /* save series visibilty to apply after zoom or live reload */
      saveSeriesVisibility($scope.metric.legendData);
      //}
    }


    function getMaximumOfSelectedSeries(legendData){

      var maxValue = 0;

      _.each(legendData, function(legendItem){

        if(legendItem.visible === true && legendItem.max > maxValue ) maxValue = legendItem.max;
      })

      return maxValue;
    }

  };


}


