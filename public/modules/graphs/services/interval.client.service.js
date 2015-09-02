'use strict';

angular.module('graphs').factory('Interval', [
	function() {

        var Interval = {
            clearAll: clearAll,
            active: [],
            clearIntervalForMetric: clearIntervalForMetric

        };

        return Interval;


        function clearIntervalForMetric (metricId){

             _.each(Interval.active, function(intervalObject, i){

                if(intervalObject.metricId === metricId){
                    clearInterval(intervalObject.intervalId);

                }
            })

            Interval.active =_.reject(Interval.active, function(intervalObject ){

                return intervalObject.metricId === metricId;
            })
        }

        function clearAll(){

            _.each(Interval.active, function(intervalObject){

                clearInterval(intervalObject.intervalId);
            })
        }

    }
]);
