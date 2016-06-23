'use strict';

angular.module('core').directive('runningTests', RunningTestsDirective);

function RunningTestsDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/running-tests.client.view.html',
        controller: RunningTestsDirectiveController
    };

    return directive;

    /* @ngInject */
    function RunningTestsDirectiveController ($scope, $state, $interval, $timeout, RunningTests, TestRuns, mySocket) {

            RunningTests.get().success(function(runningTests){


                /* calculate progress */

                _.each(runningTests, function(testRun, i){

                    testRun.progress = (testRun.lastKnownDuration) ? Math.round((new Date().getTime() - new Date(testRun.start).getTime()) / testRun.lastKnownDuration * 100) : undefined;
                    testRun.humanReadablelastKnownDuration = (testRun.lastKnownDuration) ? TestRuns.calculateDuration(testRun.lastKnownDuration): undefined;
                })

                $scope.runningTests = runningTests;

            });

        /*socket.io*/

        var room = 'running-test';


        $timeout(function(){

            mySocket.emit('room', room);
            console.log('Joined room: ' + room);

        },100);
        

        mySocket.on('runningTest', function (message) {
            switch (message.event) {

                case 'saved':

                    var testRun = message.testrun;

                    testRun.progress = (message.testrun.lastKnownDuration) ? Math.round((new Date().getTime() - new Date(message.testrun.start).getTime()) / message.testrun.lastKnownDuration * 100) : undefined;
                    testRun.humanReadablelastKnownDuration = (message.testrun.lastKnownDuration) ? TestRuns.calculateDuration(message.testrun.lastKnownDuration): undefined;
                    var index = $scope.runningTests.map(function(runningTest){ return runningTest.testRunId; }).indexOf(message.testrun.testRunId);

                    if (index === -1){

                        $scope.runningTests.unshift(testRun);

                    }else{

                        $scope.runningTests[index] = testRun;
                    }


                    break;

                case 'removed':

                    var index = $scope.runningTests.map(function(runningTest){ return runningTest.testRunId; }).indexOf(message.testrun.testRunId);
                    $scope.runningTests.splice(index, 1);


            }
        });




        $scope.$on('$destroy', function () {
            //  leave the room
            mySocket.emit('exit-room', room);
        });

    }
}
