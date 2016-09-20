'use strict';

angular.module('core').directive('recentTests', RecentTestsDirective);

function RecentTestsDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/recent-tests.client.view.html',
        controller: RecentTestsDirectiveController
    };

    return directive;

    /* @ngInject */
    function RecentTestsDirectiveController ($scope, $state, $interval, $timeout, TestRuns, mySocket) {

        $scope.completedTestRunsOnly = true;


        $scope.recentTestPeriodOptions = [
            {value: 1 , label: 'Last day'},
            {value: 2, label: 'Last 2 days'},
            {value: 3, label: 'Last 3 days'},
            {value: 7, label: 'Last week'}
        ];

        $scope.recentTestPeriod = TestRuns.recentTestPeriod;

        $scope.selectedRecentTestPeriodOptionIndex = $scope.recentTestPeriodOptions.map(function(recentTestPeriod){ return recentTestPeriod.value;}).indexOf(parseInt($scope.recentTestPeriod));

        $scope.$watch('recentTestPeriod', function (newVal, oldVal) {

            if(newVal !== oldVal){

                TestRuns.recentTestPeriod = $scope.recentTestPeriod;

            }
        });

        $scope.$watch('testRunFilter', function (newVal, oldVal) {

            if(newVal !== oldVal){

                $scope.filteredRecentTestRuns = filterRecentTestRuns($scope.recentTests);

            }
        });


        $scope.clearTestRunFilter = function(){

            $scope.testRunFilter = '';

        };


        /*socket.io*/

        var room = 'recent-test';

        mySocket.emit('room', room);
        console.log('Joined room: ' + room);



        mySocket.on('testrun', function (message) {
            switch (message.event) {

                case 'saved':


                    var index = $scope.recentTests.map(function(testRun){ return testRun.testRunId; }).indexOf(message.testrun.testRunId);

                    if (index === -1){

                        $scope.recentTests.unshift(message.testrun);

                    }else{

                        $scope.recentTests[index] = message.testrun;
                    }

                    //console.log('added test run: ' + message.testrun.testRunId);

                    break;

                case 'removed':

                    var index = $scope.recentTests.map(function(testRun){ return testRun.testRunId; }).indexOf(message.testrun.testRunId);

                    if(index !== -1) $scope.recentTests.splice(index, 1);

                    //console.log('removed test run: ' + message.testrun.testRunId);

                    break;

            }
        });


        getRecentTests();

        function getRecentTests() {
            TestRuns.getRecentTestruns($scope.recentTestPeriod).success(function (recentTests) {

                $scope.recentTests = recentTests;
                $scope.filteredRecentTestRuns = filterRecentTestRuns($scope.recentTests);


            });

        }

        function filterRecentTestRuns(recentTestRuns){

            if ($scope.testRunFilter === ''){

                return recentTestRuns;

            }else {
                var filteredRecentTestRuns = [];
                var recentTestRunFilterRegExp = new RegExp($scope.testRunFilter, 'i');


                _.each(recentTestRuns, function (recentTestRun) {

                    /* see if alias matches metricFilter */
                    if (recentTestRunFilterRegExp.test(recentTestRun.productName) || recentTestRunFilterRegExp.test(recentTestRun.dashboardName)){

                          filteredRecentTestRuns.push(recentTestRun);
                    }

                });

                return filteredRecentTestRuns;
            }
        }


        $scope.updaterecentTestRuns = function(){

            getRecentTests();
        }

        $scope.$on('$destroy', function () {
            //  leave the room
            mySocket.emit('exit-room', room);
        });

    }
}
