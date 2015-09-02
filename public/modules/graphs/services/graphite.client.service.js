'use strict';

angular.module('graphs').factory('Graphite', ['$http','$q', '$log', '$state', 'Events', 'Utils',
	function($http, $q, $log, $state, Events, Utils) {

        var Graphite = {
            getData: getData,
            addEvents: addEvents//,
            //createHighstockSeries: createHighstockSeries

        };

        return Graphite;


        function addFlagData (series, events, productName, dashboardName, testRunId){

            var flags  = {
                "type": "flags",
                //"onSeries": series,
                showInLegend: false,
                "shape": "squarepin",
                "events":{
                    "click" : function (e){

                        Events.selected = {};

                        Events.selected.productName = productName;
                        Events.selected.dashboardName = dashboardName;
                        Events.selected.testRunId = testRunId;
                        Events.selected._id = e.point.id;
                        Events.selected.eventTimestamp = e.point.x;
                        Events.selected.eventDescription = e.point.text;


                        $state.go('editEvent', {
                            "productName": productName,
                            "dashboardName": dashboardName,
                            "eventId": e.point.id
                        });

                    }
                }

            };

            var flagsData = [];
            var sortedEvents = events.sort(Utils.dynamicSort('eventTimestamp'));
            var eventDescriptionPattern = new RegExp(/^([0-9]+)/);
            var eventIndex = 1;


            _.each(sortedEvents, function(event, i){
                if(event.eventDescription !== 'start' && event.eventDescription !== 'end') {

                    var epochTimestamp = new Date(event.eventTimestamp).getTime();

                    var eventTitle = (eventDescriptionPattern.test(event.eventDescription)) ? event.eventDescription.match(eventDescriptionPattern)[1] : eventIndex;


                    flagsData.push({x: epochTimestamp,
                                    title: eventTitle,
                                    text: event.eventDescription,
                                    id: event._id
                                    });
                    eventIndex++;
                }
            })

            flags.data = flagsData;


            series.push(flags);

            return series;

        }

        function addEvents(series, from, until, productName, dashboardName, testRunId){

            var deferred = $q.defer();
            var promise = deferred.promise;

            var convertedFrom = convertTime(from);
            var convertedUntil = convertTime(until);

            Events.listEventsForTestRun(productName, dashboardName, convertedFrom, convertedUntil)
                .success(function(events){
                    deferred.resolve(
                        addFlagData (series, events, productName, dashboardName, testRunId)
                    )
                }).error(function(msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });


            return promise;

        }

        function createChartSeries (graphiteData){

            var series = [];
            for (var j = 0; j < graphiteData.length; j++) {

                var data = [];

                for (var i = 0; i < graphiteData[j].datapoints.length; i++) {

                    if (graphiteData[j].datapoints[i][0] !== null) {

                        data.push([graphiteData[j].datapoints[i][1] * 1000, graphiteData[j].datapoints[i][0]]);

                    }

                }

                series.push({
                    name: graphiteData[j].target,
                    data: data,
                    tooltip: {
                        yDecimals: 0
                    }
                });
            }

            return series;


        }



        function getData(from, until, targets, maxDataPoints) {

            var urlEncodedTargetUrl = '';

            var queryFrom = /^\d+$/.test(from) ?  Math.round(from / 1000) : from;
            var queryUntil = /^\d+$/.test(until) ?  Math.round(until / 1000) : until;

            _.each(targets, function(target){

                urlEncodedTargetUrl = urlEncodedTargetUrl + '&target=' + encodeURI(target);

            });

            var deferred = $q.defer();
            var promise = deferred.promise;


            $http.jsonp('/graphite?' + urlEncodedTargetUrl + '&from=' + queryFrom + '&until=' + queryUntil + '&maxDataPoints=' + maxDataPoints + '&callback=JSON_CALLBACK')
                .success(function(graphiteData) {
                    deferred.resolve(
                        createChartSeries(graphiteData)
                    )

                }).error(function(msg, code) {
                    deferred.reject(msg);
                    $log.error(msg, code);
                });

            return promise;
        }



    function convertTime(inputTime){

        var outputTime;
        var inputTimePattern = new RegExp(/-([0-9]+)(h|d|w|mon|min|y|2)/);
        var numberOf = (inputTimePattern.test(inputTime)) ? inputTime.match(inputTimePattern)[1] : "";
        var timeUnit = (inputTimePattern.test(inputTime)) ? inputTime.match(inputTimePattern)[2] : "";
        if (inputTime == "now"){

            outputTime = new Date().getTime();
        }else {

            switch (timeUnit) {


                case "s":

                    outputTime = new Date() - numberOf
                    break;

                case "min":

                    outputTime = new Date() - (numberOf * 60 * 1000)
                    break;

                case "h":

                    outputTime = new Date() - (numberOf * 3600 * 1000)
                    break;


                case "d":

                    outputTime = new Date() - (numberOf * 3600 * 24 * 1000)
                    break;

                case "w":

                    outputTime = new Date() - (numberOf * 3600 * 24 * 7 * 1000)
                    break;

                case "mon":

                    outputTime = new Date() - (numberOf * 3600 * 24 * 7 * 30 * 1000)
                    break;

                default:

                    outputTime = inputTime;//Math.round(inputTime / 1000);
                    break;
            }
        }

        return outputTime;

    }

    }
]);
