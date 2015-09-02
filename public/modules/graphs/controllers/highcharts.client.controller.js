'use strict';

angular.module('graphs').controller('HighchartsController', ['$scope','Graphite','$stateParams', '$state', 'TestRuns', 'Metrics', 'Dashboards', 'Tags','Events',
	function($scope, Graphite, $stateParams, $state, TestRuns, Metrics, Dashboards, Tags, Events) {

        /* Zero copied logic */

        $scope.clipClicked = function(){

            $scope.showUrl = false;

        }

        $scope.hasFlash = function () {
            var hasFlash = false;
            try {
                var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (fo) {
                    hasFlash = true;
                    return hasFlash;
                }
            } catch (e) {
                if (navigator.mimeTypes
                    && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
                    && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                    hasFlash = true;
                    return hasFlash;
                }
            }
        }
        /* set Tags form graph */

        $scope.setTags = function (){

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


        }

        /* update Tags form graph */

        $scope.updateTags = function(){

            $scope.showTags = false;

            Metrics.update($scope.metric).success(function(metric){

                if(Dashboards.updateTags($scope.metric.tags)){

                    Dashboards.update().success(function(dashboard){

                        $scope.dashboard = Dashboards.selected;
                        /* Get tags used in metrics */
                        $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                    });

                }

                $state.go('viewGraphs',{"productName":$stateParams.productName, "dashboardName":$stateParams.dashboardName, "testRunId" : $stateParams.testRunId, tag: metric.tags[metric.tags.length -1].text});


            });

        }

        $scope.tagRemoved = function(tag){

            if(tag.text === $stateParams.tag){

                Metrics.update($scope.metric).success(function(metric){

                    if(Dashboards.updateTags($scope.metric.tags)){

                        Dashboards.update().success(function(dashboard){

                            $scope.dashboard = Dashboards.selected;
                            /* Get tags used in metrics */
                            $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                        });

                    }

                    $state.go($state.current, {}, {reload: true});



                });

            }

        }

        /* generate deeplink to share metric graph */
        $scope.setMetricShareUrl = function (metricId) {


            if(TestRuns.zoomFrom){

                $scope.metricShareUrl = location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag + '/' + metricId + '?zoomFrom=' + TestRuns.zoomFrom + '&zoomUntil=' + TestRuns.zoomUntil;

            }else{

                $scope.metricShareUrl = location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag + '/' + metricId;
            }

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


        }

        /* Open accordion by default, except for the "All" tab */


        $scope.$watch('value', function (newVal, oldVal) {

            if ($stateParams.metricId) {

                _.each($scope.metrics, function (metric, i) {

                    if (metric._id === $stateParams.metricId)
                        $scope.metrics[i].isOpen = true;

                })

            } else {

                if (newVal !== 'All') {

                    _.each($scope.metrics, function (metric, i) {

                        $scope.metrics[i].isOpen = true;

                    })

                }
            }
        });

        /* If zoom lock is checked, update all graphs when zoom is applied in one */
        $scope.$watch(function (scope) {
                return TestRuns.zoomFrom
            },
            function (newVal, oldVal) {

                if (newVal !== oldVal) {


                    var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : TestRuns.selected.startEpoch;
                    var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : TestRuns.selected.endEpoch;

                    updateGraph(from, until, $scope.metric.targets, false);

                }
            }
        );


        $scope.chart = {
            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x',
                    height: 500,
                    events: {
                        click: function (e) {
                            // Upon cmd-click of the chart area, go to add Event dialog
                            var addEvent = e.metaKey || e.ctrlKey;
                            if (addEvent) {
                                var eventTimestamp = new Date( Math.round(e.xAxis[0].value));
                                Events.selected.productName = $stateParams.productName
                                Events.selected.dashboardName = $stateParams.dashboardName
                                Events.selected.eventTimestamp = eventTimestamp;
                                Events.selected.testRunId = $stateParams.testRunId;
                                $state.go('createEvent', {
                                    productName: $stateParams.productName,
                                    dashboardName: $stateParams.dashboardName
                                });
                            }
                        }
                    }

                },
                rangeSelector: {
                    enabled: false
                },
                legend: {
                    enabled: true,
                    align: 'center',
                    verticalAlign: 'bottom',
                    maxHeight: 100
                    //layout: 'vertical'
                },
                tooltip: {
                    enabled: true,
                    shared: false,
                    valueDecimals: 1

                },
                exporting: {
                    filename: ''
                },
                plotOptions: {
                    series: {
                        events: {
                            legendItemClick: function(e) {
                                // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
                                var hideAllOthers = e.browserEvent.metaKey || e.browserEvent.ctrlKey;
                                if (hideAllOthers) {
                                    var seriesIndex = this.index;
                                    var series = this.chart.series;


                                    for (var i = 0; i < series.length; i++) {
                                        // rather than calling 'show()' and 'hide()' on the series', we use setVisible and then
                                        // call chart.redraw --- this is significantly faster since it involves fewer chart redraws
                                        if (series[i].index === seriesIndex) {
                                            if (!series[i].visible) series[i].setVisible(true, false);
                                        } else {
                                            if (series[i].visible) {
                                                series[i].setVisible(false, false);
                                            } else {
                                                series[i].setVisible(true, false);
                                            }
                                        }
                                    }
                                    this.chart.redraw();
                                    return false;
                                }
                            }
                        }
                    }
                }

            },
            series: [],
            title: {
                text: 'Hello'
            },
            xAxis: {
                minRange: 10000,
                events: {
                    setExtremes: function (e) {

                        var from = (typeof e.min == 'undefined' && typeof e.max == 'undefined') ? TestRuns.selected.startEpoch : Math.round(e.min);
                        var until = (typeof e.min == 'undefined' && typeof e.max == 'undefined') ? TestRuns.selected.endEpoch : Math.round(e.max);

                        /* If zoom lock is checked, set zoom timestamps in TestRuns service */
                        if ($scope.zoomLock) {

                            TestRuns.zoomFrom = from;
                            TestRuns.zoomUntil = until;
                            $scope.$apply();

                        } else {

                            updateGraph(from, until, $scope.metric.targets, true);

                        }
                    }
                },
                plotLines: []
            },
            yAxis: {
                min: 0, // this sets minimum values of y to 0
                plotLines: [{
                value: $scope.metric.requirementValue,
                width: 2,
                color: 'green',
                dashStyle: 'dash',
                label: {
                  text: 'Requirement',
                  align: 'left',
                  y: -10,
                  x: 0
                }
              }]
            },
            loading: true,
            useHighStocks: true
        }


        $scope.initConfig = function (config, metric) {
            //debugger;

            $scope.config = angular.copy(config);
            $scope.config.title.text = metric.alias;



            /* if no requirement valaue is set, remove plotline*/
            if(!$scope.metric.requirementValue) $scope.config.yAxis.plotLines=[];

            /* Set the TestRuns.selected based on $stateParams*/

            TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

                TestRuns.selected = testRun;

                /* If zoom range is set, use these to init the graph*/

                var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : TestRuns.selected.startEpoch;
                var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : TestRuns.selected.endEpoch;

                updateGraph(from, until, metric.targets, true);

            });

        }

        function updateGraph(from, until, targets, drawEvents){

            $scope.config.loading = true;

            Graphite.getData(from, until, targets, 900).then(function (series) {

                Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).then(function (seriesEvents) {


                    $scope.config.series = seriesEvents;

                    if(drawEvents) {
                        /* draw xAxis plotlines for events*/
                        if (seriesEvents[seriesEvents.length - 1].type) {

                            _.each(seriesEvents[seriesEvents.length - 1].data, function (flag) {

                                $scope.config.xAxis.plotLines.push(
                                    {
                                        value: flag.x,
                                        width: 1,
                                        color: 'blue',
                                        dashStyle: 'dash'
                                    }
                                );
                            })
                        }
                    }
                    $scope.config.loading = false;

                    $scope.config.options.exporting.filename = TestRuns.selected.testRunId + '_' + $scope.metric.alias;

                });

            });

        }
    }
]);
