'use strict';
// service used for Utilty functions
angular.module('core').factory('Utils', [
    '$http',
    function ($http) {
    var Utils = {
      dynamicSort: dynamicSort,
      dynamicSortMultiple: dynamicSortMultiple,
      dynamicSortTags: dynamicSortTags,
      getGraylogGuiUrl:getGraylogGuiUrl,
      selectedIndex: '',
      metricFilter: '',
      zoomLock: true,
      graphType: '',
      zoomRange: {
          value: '',
          label: 'Since start test run'
      },
      trendsZoomRange: {
          value: '14',
          label: 'Last 2 weeks'
      },
      zoomRangeTargetPreview: {
          value: '-10min',
          label: 'Last 10 minutes'
      },
      zoomFrom: undefined,
      zoomUntil: undefined,
      polling: undefined,
      showLegend: true,
      showTooltip: false,
      numberOfColumns: 2,
      recentTestPeriod: "1",
      selectedSeries: '',
      sortReverse: false,
      sortType: 'tags[0].text',
      reset: reset,
      loadNumberOfTestRuns: 10,
      productSelectedIndex: 0,
      completedTestRunsOnly: true,
      dateTimePickerTimestamp: undefined,
      testRunSummaryGraphsCounter: 0,
      testRunSummaryGraphsWithErrorsCounter: 0


    };
    return Utils;


    function getGraylogGuiUrl(){

        return $http.get('/get-graylog-gui-url');

    }

    function reset(){

        Utils.selectedIndex = '';
        Utils.selectedSeries = '';
        Utils.metricFilter = '';
        Utils.zoomLock = true;
        //Utils.graphType = '';
        Utils.zoomRange = {
            value: '',
            label: 'Since start test run'
        };
        Utils.zoomRangeTargetPreview = {
            value: '-10min',
            label: 'Last 10 minutes'
        };
        Utils.trendsZoomRange = {
            value: '14',
            label: 'Last 2 weeks'
        };
        Utils.zoomFrom = undefined;
        Utils.zoomUntil = undefined;
        Utils.showLegend = true;
        //Utils.numberOfColumns = 2;
        Utils.sortReverse = false;
        Utils.sortType = 'tags[0].text';
        Utils.loadNumberOfTestRuns = 10;
        Utils.completedTestRunsOnly = true;
        Utils.testRunSummaryGraphsCounter = 0;
        Utils.testRunSummaryGraphsWithErrorsCounter = 0;

    }
    function dynamicSortTags(sortOrderParam) {
        var sortOrder = 1;
        if (sortOrderParam === '-') {
            sortOrder = -1;
        }
        return function (a, b) {
            if(a.tags[0] && b.tags[0]) {
                var result = a.tags[0].text < b.tags[0].text ? -1 : a.tags[0].text > b.tags[0].text ? 1 : 0;
                return result * sortOrder;
            }else{
                var result = a.alias < b.alias ? -1 : a.alias > b.alias ? 1 : 0;
                return result * sortOrder;
            }
        };
    }



    function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      };
    }
    function dynamicSortMultiple() {
      /*
         * save the arguments object as it will be overwritten
         * note that arguments object is an array-like object
         * consisting of the names of the properties to sort by
         */
      var props = arguments;
      return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
             * as long as we have extra properties to compare
             */
        while (result === 0 && i < numberOfProperties) {
          result = dynamicSort(props[i])(obj1, obj2);
          i++;
        }
        return result;
      };
    }
  }]);
