'use strict';
// service used for Utilty functions
angular.module('graphs').service('Utils', [function () {
    var Utils = {
      dynamicSort: dynamicSort,
      dynamicSortMultiple: dynamicSortMultiple,
      dynamicSortTags: dynamicSortTags,
      selectedIndex: '',
      metricFilter: '',
      zoomLock: true,
      graphType: '',
      zoomRange: {
          value: '-10min',
          label: 'Last 10 minutes'
      },
      zoomFrom: '',
      zoomUntil: '',
      showLegend: true,
      numberOfColumns: 2,
      recentTestPeriod: "1",
      reset: reset

    };
    return Utils;

    function reset(){

        Utils.selectedIndex = '';
        Utils.metricFilter = '';
        Utils.zoomLock = true;
        //Utils.graphType = '';
        Utils.zoomRange = {
            value: '-10min',
            label: 'Last 10 minutes'
        };
        Utils.zoomFrom = '';
        Utils.zoomUntil = '';
        Utils.showLegend = true;
        Utils.numberOfColumns = 2;

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
