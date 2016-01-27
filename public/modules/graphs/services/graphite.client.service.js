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
      var flags = {
        'type': 'flags',
        //"onSeries": series,
        showInLegend: false,
        'shape': 'squarepin',
        'events': {
          'click': function (e) {
            Events.selected = {};
            Events.selected.productName = productName;
            Events.selected.dashboardName = dashboardName;
            Events.selected.testRunId = testRunId;
            Events.selected._id = e.point.id;
            Events.selected.eventTimestamp = new Date(e.point.x);
            Events.selected.eventDescription = e.point.text;
            $state.go('editEvent', {
              'productName': productName,
              'dashboardName': dashboardName,
              'eventId': e.point.id
            });
          }
        }
      };
      var flagsData = [];
      var sortedEvents = events.sort(Utils.dynamicSort('eventTimestamp'));
      var eventDescriptionPattern = new RegExp(/^([0-9]+)/);
      var eventIndex = 1;
      _.each(sortedEvents, function (event, i) {
        if (event.eventDescription !== 'start' && event.eventDescription !== 'end') {
          var epochTimestamp = new Date(event.eventTimestamp).getTime();
          var eventTitle = eventDescriptionPattern.test(event.eventDescription) ? event.eventDescription.match(eventDescriptionPattern)[1] : eventIndex;
          flagsData.push({
            x: epochTimestamp,
            title: eventTitle,
            text: event.eventDescription,
            id: event._id
          });
          eventIndex++;
        }
      });
      flags.data = flagsData;
      series.push(flags);
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

          //I've chosen to 0 out any null values, otherwise additional data series
          //could be inserted into previous data series array
          //if (datapoint[0] === null) {
          //  datapoint[0] = 0;
          //}

          /* update minimum, maximum and avg values for series */

          if(datapoint[0] !== null) {
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
      completeDygraphData.data = dygraphData;
      completeDygraphData.labels = graphLabels;

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

    function  calculateAvg(seriesAvg, datapoint, datapointIndex){
      var updatedAvg = {};

      if(datapoint !== null) {
        if(datapointIndex !== 0){

          updatedAvg.numberOfValidDatapoints = seriesAvg.numberOfValidDatapoints + 1;
          updatedAvg.value = (seriesAvg.value + datapoint) / updatedAvg.numberOfValidDatapoints;
        }else {

          updatedAvg.numberOfValidDatapoints = 1;
          updatedAvg.value = datapoint;

        }


      }else{

        updatedAvg.numberOfValidDatapoints = seriesAvg.numberOfValidDatapoints;
        updatedAvg.value = seriesAvg.value;

      }

      return updatedAvg;
    }

    function createChartSeries(graphiteData) {
      var series = [];
      for (var j = 0; j < graphiteData.length; j++) {
        var data = [];
        for (var i = 0; i < graphiteData[j].datapoints.length; i++) {
          if (graphiteData[j].datapoints[i][0] !== null) {
            data.push([
              graphiteData[j].datapoints[i][1] * 1000,
              graphiteData[j].datapoints[i][0]
            ]);
          }
        }
        if (data.length > 0) {
          series.push({
            name: graphiteData[j].target,
            data: data,
            tooltip: {yDecimals: 0}
          });
        }
      }
      return series;
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
