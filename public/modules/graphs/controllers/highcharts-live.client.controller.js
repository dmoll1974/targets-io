'use strict';

angular.module('graphs').controller('HighchartsLiveController', ['$scope', 'Interval', '$stateParams', '$state', 'Graphite', 'TestRuns', 'Metrics', 'Dashboards', 'Tags', '$q','$http', '$log','Events',
    function($scope, Interval, $stateParams, $state, Graphite, TestRuns, Metrics, Dashboards, Tags,  $q, $http, $log, Events) {

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

        /* update Tags form graph */

        $scope.updateTags = function(){

            $scope.showTags = false;

            Metrics.update($scope.metric).success(function(metric){

                Dashboards.updateTags($stateParams.productName, $stateParams.dashboardName, metric.tags, function(updated){

                    if(updated) {

                        Dashboards.update().success(function (dashboard) {

                            $scope.dashboard = Dashboards.selected;
                            /* Get tags used in metrics */
                            $scope.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

                        });
                    }
                });


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

        $scope.setMetricShareUrl = function(metricId){

            if(TestRuns.zoomFrom){

                $scope.metricShareUrl = location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.tag + '/' + metricId + '?zoomFrom=' + TestRuns.zoomFrom + '&zoomUntil=' + TestRuns.zoomUntil;

            }else {

                $scope.metricShareUrl = location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.tag + '/' + metricId;

            }
            if($scope.showUrl){

                switch($scope.showUrl){

                    case true:
                        $scope.showUrl = false;
                        break;
                    case false:
                        $scope.showUrl = true;
                        break;
                }

            }else{

                $scope.showUrl = true;
            }
        }


        /* If zoom is applied, replace series */
        //$scope.$watch(function (scope) {
        //        return TestRuns.zoomFrom
        //    },
        //    function (newVal, oldVal) {
        //
        //        if (newVal !== oldVal) {
        //
        //
        //            var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : TestRuns.selected.start;
        //            var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : TestRuns.selected.end;
        //
        //            updateGraph(from, until, $scope.metric.targets, function(series) {
        //
        //                $scope.config.loading = false;
        //                $scope.config.series = series;
        //
        //
        //            });
        //
        //        }
        //    }
        //);

        /* If zoom lock is checked, update all graphs when zoom is applied in one */
        $scope.$watch(function (scope) {
                return TestRuns.zoomFrom
            },
            function (newVal, oldVal) {

                if (newVal !== oldVal) {


                    Interval.clearAll();

                    var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : TestRuns.selected.startEpoch;
                    var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : TestRuns.selected.endEpoch;

                    var chart = angular.element($scope.graphSelector).highcharts();

                    while(chart.series.length >0){
                        chart.series[0].remove(false); //deletes all series
                    }

                    chart.showLoading('Loading data ...');

                    updateGraph(TestRuns.zoomFrom, TestRuns.zoomUntil, $scope.metric.targets, function(series) {

                        chart.hideLoading();

                        _.each(series, function(serie){

                            chart.addSeries(serie, false);
                        });

                        chart.redraw();

                    });

                }
            }
        );

        /* Open accordion by default, except for the "All" tab */

        $scope.$watch('value', function (newVal, oldVal) {

            if($stateParams.metricId){

                _.each($scope.metrics, function (metric, i) {

                    if(metric._id === $stateParams.metricId )
                        $scope.metrics[i].isOpen = true;

                })

            }else {

                if (newVal !== 'All') {

                    _.each($scope.metrics, function (metric, i) {

                        $scope.metrics[i].isOpen = true;

                    })

                }
            }
        });

        /* stop data polling when accordion is closed */

        $scope.$watch('metric.isOpen', function (newVal, oldVal) {

            if (newVal !== oldVal && newVal === false) Interval.clearIntervalForMetric($scope.metric._id);

        });

        /* stop data polling when element is destroyed by ng-if */

        $scope.$on("$destroy", function() {

            Interval.clearIntervalForMetric($scope.metric._id);

        });


        /* reinitialise graph when zoomRange is changed */

        $scope.$watch('zoomRange', function (newVal, oldVal) {

            if (newVal !== oldVal) {


                TestRuns.zoomRange = $scope.zoomRange;


                //var seriesArray = $scope.config.series;
                //var seriesArraySize = seriesArray.length;
                //
                //for (var i = 0; i < seriesArraySize; i++) {
                //
                //    seriesArray.splice(0, 1);
                //}

                var chart = angular.element($scope.graphSelector).highcharts();
                chart.destroy();
                $scope.initConfig( $scope.metric, $scope.chartIndex);
            }
        });

        var defaultChartConfig =
        {
            chart: {
                type: 'line',
                zoomType: 'x',
                height: 500,
                events: {
                    click: function (e) {
                        // Upon cmd-click of the chart area, go to add Event dialog
                        var addEvent = e.metaKey || e.ctrlKey;
                        if (addEvent) {
                            var eventTimestamp = new Date(Math.round(e.xAxis[0].value));
                            Events.selected.productName = $stateParams.productName
                            Events.selected.dashboardName = $stateParams.dashboardName
                            Events.selected.eventTimestamp = eventTimestamp;
                            Events.selected.testRunId = $stateParams.testRunId;
                            $state.go('createEvent', {
                                productName: $stateParams.productName,
                                dashboardName: $stateParams.dashboardName
                            });
                        }
                    },
                    load: function () {

                            /* Clear interval that might be already running for this metric */
                            Interval.clearIntervalForMetric($scope.metric._id);

                            var chart = angular.element($scope.graphSelector).highcharts();

                            var intervalId = setInterval(function () {

                                Graphite.getData($scope.zoomRange, 'now', $scope.metric.targets, 900, $stateParams.productName, $stateParams.dashboardName).then(function (graphiteSeries) {

                                    Graphite.addEvents(graphiteSeries, $scope.zoomRange, 'now', $stateParams.productName, $stateParams.dashboardName).then(function (series) {

                                        /* update series */
                                        _.each(series, function (serie) {

                                            _.each(chart.series, function (existingSerie, i) {


                                                if (serie.name === existingSerie.name) {

                                                    var newDatapoints = _.filter(serie.data, function (newDataPoint) {

                                                        var isNew = true;
                                                        _.each(existingSerie.data, function (existingDataPoint) {

                                                            if (newDataPoint[0] === existingDataPoint.x) isNew = false;

                                                        })

                                                        return isNew;

                                                    })

                                                    if (newDatapoints.length > 0) {

                                                        _.each(newDatapoints, function (datapoint) {

                                                            chart.series[i].addPoint([datapoint[0], datapoint[1]], true, true, true);
                                                            //chart.series[i].data.push([datapoint[0], datapoint[1]]);
                                                        })

                                                    }


                                                    //return;
                                                }
                                            })


                                        })

                                    });
                                });


                                //console.log('intervalIds:' + Interval.active)

                            }, 10000);

                            Interval.active.push({intervalId: intervalId, metricId: $scope.metric._id});

                            }
                    }

                },

                rangeSelector: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },

                legend: {
                    enabled: true,
                    align: 'center',
                    verticalAlign: 'bottom',
                    maxHeight: 100,
                    labelFormatter: hcLabelRender,
                    itemWidth: 300
                },
                tooltip: {
                    enabled: true,
                    shared: false,
                    valueDecimals: 1

                },

                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        events: {
                            legendItemClick: function (e) {
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
                            },
                            click: function (event) {
                                // Upon cmd-click of a legend item, rather than toggling visibility, we want to hide all other items.
                                var hideAllOthers = event.metaKey || event.ctrlKey;
                                var seriesIndex = this.index;
                                var series = this.chart.series;

                                if (hideAllOthers) {

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
                                } else {

                                    series[seriesIndex].setVisible(false, false);
                                }

                                this.chart.redraw();
                                return false;

                            }
                        }
                    }
                },
                //series: $scope.series,
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
                            if ($scope.zoomLock === true) {

                                TestRuns.zoomFrom = from;
                                TestRuns.zoomUntil = until;
                                $scope.$apply();

                            } else {

                                var chart = angular.element($scope.graphSelector).highcharts();

                                while (chart.series.length > 0) {
                                    chart.series[0].remove(false); //deletes all series
                                }

                                chart.showLoading('Loading data ...');

                                updateGraph(from, until, $scope.metric.targets, function (series) {

                                    chart.hideLoading();

                                    _.each(series, function (serie) {

                                        chart.addSeries(serie, false);
                                    });

                                    chart.redraw();

                                });

                            }
                        }
                    },
                    plotLines: []
                },
                series: [],
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
                }
        }



        $scope.initConfig = function (metric, index) {


            $scope.chartIndex = index;
            $scope.metric = metric;
            $scope.graphSelector = '#chart-' + index;
            $scope.config = angular.extend(defaultChartConfig);
            $scope.config.title.text = metric.alias;
            if(!metric.requirementValue) $scope.config.yAxis.plotLines=[];
            //$scope.config.chart.renderTo = 'chart-' + index;

            setTimeout(function(){
                angular.element($scope.graphSelector).highcharts('StockChart', $scope.config);
                var chart = angular.element($scope.graphSelector).highcharts();

                chart.showLoading('Loading data ...');


                var from = (TestRuns.zoomFrom) ? TestRuns.zoomFrom : $scope.zoomRange;
                var until = (TestRuns.zoomUntil) ? TestRuns.zoomUntil : 'now';

                updateGraph(from, until, metric.targets, function(series) {

                    while(chart.series.length >0){
                        chart.series[0].remove(false); //deletes all series
                    }

                    chart.hideLoading();

                    _.each(series, function(serie){

                        chart.addSeries(serie, false);
                    });

                    if(series.length > 0) {
                        /* draw xAxis plotlines for events*/
                        if (series[series.length - 1].type) {

                            _.each(series[series.length - 1].data, function (flag) {

                                chart.options.xAxis[0].plotLines.push(
                                    {
                                        value: flag.x,
                                        width: 1,
                                        color: 'blue',
                                        dashStyle: 'dash'
                                    }
                                );
                            })
                        }
                    }else{

                        chart.showLoading('No data to display');

                    }

                    chart.redraw();

                });

            },100)
        }

        function updateGraph(from, until, targets, callback){


            Graphite.getData(from, until, targets, 900).then(function (series) {

                if(series.length > 0) {

                    Graphite.addEvents(series, from, until, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).then(function (seriesEvents) {

                        callback(seriesEvents);

                    });

                }else{
                    callback(series);

                }
            });

        }

        function hcLabelRender(){
            var s = this.name;
            var r = "";
            var lastAppended = 0;
            var lastSpace = -1;
            for (var i = 0; i < s.length; i++) {
                if (s.charAt(i) == ' ') lastSpace = i;
                if (i - lastAppended > 40) {
                    if (lastSpace == -1) lastSpace = i;
                    r += s.substring(lastAppended, lastSpace);
                    lastAppended = lastSpace;
                    lastSpace = -1;
                    r += "<br>";
                }
            }
            r += s.substring(lastAppended, s.length);
            return r;
        }
    }
]);
