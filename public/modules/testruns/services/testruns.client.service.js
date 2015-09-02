'use strict';

//Events service used to communicate Events REST endpoints
angular.module('events').factory('TestRuns', ['$http', 'Products', 'Dashboards','Events',
    function($http, Products, Dashboards, Events) {

        var TestRuns = {
//            'get' : getFn,
            selected: {},
            listTestRunsForDashboard: listTestRunsForDashboard,
            zoomFrom: '',
            zoomUntil: '',
            zoomRange: '',
            getTestRunById: getTestRunById,
            getRunningTest: getRunningTest,
            persistTestRunByIdFromEvents: persistTestRunByIdFromEvents,
            delete: deleteFn

        };

        return TestRuns;

        function getRunningTest(productName, dashboardName){

            return $http.get('/running-test/' + productName + '/' + dashboardName);
        }

        function getTestRunById(productName, dashboardName, testRunId){

            return $http.get('/testrun/' + productName + '/' + dashboardName + '/' + testRunId);//.success(function(testRun){
            //
            //    TestRuns.selected = testRun;
            //
            //});

        }

        function listTestRunsForDashboard(productName, dashboardName){

            return $http.get('/testruns-dashboard/' + productName + '/' + dashboardName );

        };

        function persistTestRunByIdFromEvents(productName, dashboardName , testRunId){

            return $http.get('/persist-testrun/' + productName + '/' + dashboardName + '/' + testRunId );

        };

        function deleteFn(productName, dashboardName, testRunId){
            return $http.delete('/testrun/' + productName + '/' + dashboardName + '/' +  testRunId);
        }

    }
]);
