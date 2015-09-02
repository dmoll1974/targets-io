'use strict';

//Events service used to communicate Events REST endpoints
angular.module('events').factory('Events', ['$http', 'Products', 'Dashboards',
	function($http, Products, Dashboards) {

        var Events = {
            selected: {},
            getTestRunId: getTestRunId,
            getDescriptions: getDescriptions,
            listEventsForDashboard: listEventsForDashboard,
            listEventsForTestRun: listEventsForTestRun,
            list: [],
            update: update,
            create: create,
            delete: deleteFn

        };

        return Events;

        function deleteFn(eventId){
            return $http.delete('/events/' + eventId);
        }

        function listEventsForDashboard(productName, dashboardName){

            return $http.get('/events-dashboard/' + productName + '/' + dashboardName);
        
        };

        function listEventsForTestRun(productName, dashboardName, from, until){

            return $http.get('/events-testrun/' + productName + '/' + dashboardName + '/' + from + '/' + until);

        };

        function getTestRunId(events){

            var listOfTestRunIds= [];

            _.each(events, function (event){

                listOfTestRunIds.push(event.testRunId);

            })

            return _.uniq(listOfTestRunIds);


        };

        function getDescriptions(events){

            var descriptions = ['start', 'end'];

            _.each(events, function (event){

                descriptions.push(event.eventDescription);

            })

            return _.uniq(descriptions);

        }

        function create(event){
            return $http.post('/events', event);
        }

        function update(event){
            return $http.put('/events/' + event._id, event);
        }

    }
]);
