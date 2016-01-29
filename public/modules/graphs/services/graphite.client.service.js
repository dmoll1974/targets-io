'use strict';
angular.module('graphs').factory('Graphite', [
  '$http',
  '$q',
  '$log',
  '$state',
  'Events',
  'Utils',
  function ($http, $q, $log, $state, Events, Utils) {
    var Graphite = {
      getData: getData,
      addEvents: addEvents,
      findMetrics: findMetrics
    };
    return Graphite;

    function findMetrics(query) {

      return $http.get('/graphite/find/' + query);
    }

    function addFlagData(series, events, productName, dashboardName, testRunId) {

      var annotations = [];
      var sortedEvents = events.sort(Utils.dynamicSort('eventTimestamp'));
      var eventDescriptionPattern = new RegExp(/^([0-9]+)/);
      var eventIndex = 1;
      _.each(sortedEvents, function (event, i) {
        if (event.eventDescription !== 'start' && event.eventDescription !== 'end') {
          var timestamp = new Date(event.eventTimestamp).getTime();
          var eventTitle = eventDescriptionPattern.test(event.eventDescription) ? event.eventDescription.match(eventDescriptionPattern)[1] : eventIndex;
          annotations.push({
            series: series.labels[1],
            x: timestamp,
            shortText: eventTitle,
            text: event.eventDescription,
            attachAtBottom: true

          });
          eventIndex++;
        }
      });
      series.annotations  = annotations;
      return series;
    }

    function addEvents(series, from, until, productName, dashboardName, testRunId) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var convertedFrom = convertTime(from);
      var convertedUntil = convertTime(until);
      Events.listEventsForTestRun(productName, dashboardName, convertedFrom, convertedUntil).success(function (events) {
        deferred.resolve(addFlagData(series, events, productName, dashboardName, testRunId));
      }).error(function (msg, code) {
        deferred.reject(msg);
        $log.error(msg, code);
      });
      return promise;
    }

    function createDygraphSeries(result) {

      var legendData = [];
      var seriesTotal = {};
      seriesTotal.value = 0;
      seriesTotal.numberOfValidDatapoints = 0;

      var seriesMin;
      var seriesMax = 0;

      var graphMaxValue = 0;
      var graphNumberOfValidDatapoints = 0;

      var completeDygraphData = {};
      var graphiteData = new Object();
      var graphLabels = ["DateTime"];

      _.each(result, function (item, index) {

        //"Headers for native format(Array) must be specified via the labels option.
        //There's no other way to set them. -http://dygraphs.com/data.html#array"

        graphLabels.push(item.target);

        //fill out the array with the metrics
        _.each(item.datapoints, function (datapoint, datapointIndex) {

          var tempDate = datapoint[1];

          if (!(tempDate in graphiteData)) {
            graphiteData[tempDate] = [];
          }

          /* set null values to NaN to show holes in graphs */
          if (datapoint[0] === null) {
            datapoint[0] = NaN;
          }

          /* update minimum, maximum and avg values for series */

          if(!isNaN(datapoint[0])) {
            seriesMin = (!seriesMin || seriesMin > datapoint[0]) ? datapoint[0] : seriesMin;
            seriesMax = (seriesMax < datapoint[0]) ? datapoint[0] : seriesMax;
            seriesTotal = addToTotals(seriesTotal, datapoint[0]);

            /* keep track of graph maximum value */
            if (datapoint[0] > graphMaxValue) graphMaxValue = datapoint[0];
          }

          graphiteData[tempDate].push([datapoint[0]]);

        });


        legendData.push({
          id: index,
          name: item.target,
          min: Math.round(seriesMin * 100) /100 ,
          max: Math.round(seriesMax * 100) /100 ,
          avg: Math.round((seriesTotal.value / seriesTotal.numberOfValidDatapoints)  * 100) /100,
          visible: true,
          numberOfValidDatapoints: seriesTotal.numberOfValidDatapoints
        })

        graphNumberOfValidDatapoints = graphNumberOfValidDatapoints + seriesTotal.numberOfValidDatapoints;
        seriesTotal.value = 0;
        seriesTotal.numberOfValidDatapoints = 0;
        seriesMin = null;
        seriesMax = 0;
      });
        //console.log("graphiteData: ", graphiteData);

        //need to flatten the hash to an array for Dygraph
        var dygraphData = [];

        for (var key in graphiteData) {
          if (graphiteData.hasOwnProperty(key)) {

            var tempArray = [];
            tempArray.push(new Date(key * 1000));

            var dataSeries = graphiteData[key];

            for (var key in dataSeries) {
              if (dataSeries.hasOwnProperty(key)) {
                tempArray.push(dataSeries[key]);
              }
            }
            dygraphData.push(tempArray);
          }
        }


      completeDygraphData.legendData = legendData;
      completeDygraphData.maxValue = graphMaxValue;
      completeDygraphData.graphNumberOfValidDatapoints = graphNumberOfValidDatapoints;
      completeDygraphData.data = dygraphData;
      completeDygraphData.labels = graphLabels;

      /* now add annotations from events */


      return completeDygraphData;
    }


    function  addToTotals(seriesTotal, datapoint){
      var updatedTotal = {};

      if(datapoint !== null) {

          updatedTotal.numberOfValidDatapoints = seriesTotal.numberOfValidDatapoints + 1;
          updatedTotal.value = seriesTotal.value + datapoint;

      }else{

        updatedTotal.numberOfValidDatapoints = seriesTotal.numberOfValidDatapoints;
        updatedTotal.value = seriesTotal.value;

      }

      return updatedTotal;
    }



    function getData(from, until, targets, maxDataPoints) {
      var urlEncodedTargetUrl = '';
      var queryFrom = /^\d+$/.test(from) ? Math.round(from / 1000) : from;
      var queryUntil = /^\d+$/.test(until) ? Math.round(until / 1000) : until;
      _.each(targets, function (target) {
        urlEncodedTargetUrl = urlEncodedTargetUrl + '&target=' + encodeURI(target);
      });
      var deferred = $q.defer();
      var promise = deferred.promise;
      $http.jsonp('/graphite?' + urlEncodedTargetUrl + '&from=' + queryFrom + '&until=' + queryUntil + '&maxDataPoints=' + maxDataPoints + '&callback=JSON_CALLBACK').success(function (graphiteData) {
        deferred.resolve(createDygraphSeries(graphiteData));
      }).error(function (msg, code) {
        deferred.reject(msg);
        $log.error(msg, code);
      });
      return promise;
    }

    function convertTime(inputTime) {
      var outputTime;
      var inputTimePattern = new RegExp(/-([0-9]+)(h|d|w|mon|min|y|2)/);
      var numberOf = inputTimePattern.test(inputTime) ? inputTime.match(inputTimePattern)[1] : '';
      var timeUnit = inputTimePattern.test(inputTime) ? inputTime.match(inputTimePattern)[2] : '';
      if (inputTime == 'now') {
        outputTime = new Date().getTime();
      } else {
        switch (timeUnit) {
          case 's':
            outputTime = new Date() - numberOf;
            break;
          case 'min':
            outputTime = new Date() - numberOf * 60 * 1000;
            break;
          case 'h':
            outputTime = new Date() - numberOf * 3600 * 1000;
            break;
          case 'd':
            outputTime = new Date() - numberOf * 3600 * 24 * 1000;
            break;
          case 'w':
            outputTime = new Date() - numberOf * 3600 * 24 * 7 * 1000;
            break;
          case 'mon':
            outputTime = new Date() - numberOf * 3600 * 24 * 7 * 30 * 1000;
            break;
          default:
            outputTime = inputTime;
            //Math.round(inputTime / 1000);
            break;
        }
      }
      return outputTime;
    }
  }
]);
