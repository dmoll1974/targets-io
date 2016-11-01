'use strict';

angular.module('dashboards' +
    '').directive('jenkinsJobStatus', JenkinsJobStatusDirective);

function JenkinsJobStatusDirective () {

    var directive = {
        scope: {
            dashboard: '=',
        },
        restrict: 'EA',
        templateUrl: 'modules/dashboards/directives/jenkins-job-status.client.view.html',
        controller: JenkinsJobStatusDirectiveController
    };

    return directive;

    /* @ngInject */
    function JenkinsJobStatusDirectiveController ($scope, $state, $stateParams, $timeout, Graphite, $mdDialog, $mdToast, Jenkins, Utils, $interval, Products, $window, $rootScope, AuthenticationService, $http) {

        $scope.startJob = startJob;
        $scope.stopJob = stopJob;
        $scope.jenkinsJobConfig = jenkinsJobConfig;
        $scope.jenkinsJobConsole = jenkinsJobConsole;
        $scope.signin = signin;

        /* activate */
        activate();

        /* watches */

        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(Utils.polling);

        });

        /* functions */

        function activate(){

            if($http.defaults.headers.common['Authorization']) {
                Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (loginResult) {

                    if (loginResult.statusCode === 200) {

                        $scope.authenticationFailed = false;
                        jenkinsJobStatusPolling();
                        if (Utils.polling === undefined) Utils.polling = $interval(jenkinsJobStatusPolling, 15000);
                        $mdDialog.hide();

                    } else {

                        AuthenticationService.ClearCredentials();
                        $scope.authenticationFailed = true;
                        $mdDialog.hide();
                        var content = 'Authentication failed';
                        var toast = $mdToast.simple()
                            .action('OK')
                            .highlightAction(true)
                            .position('top center')
                            .hideDelay(3000);

                        $mdToast.show(toast.content(content)).then(function (response) {
                        });


                    }


                })
            }else{

                $scope.authenticationFailed = true;

            }


        }


        var jenkinsJobStatusPolling = function ($event) {


            Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {


                $scope.jenkinsJobQueueWhy = status.body.inQueue ? status.body.queueItem.why : '';

                $scope.jenkinsJobStatus = status.body.inQueue ? 'Queued' : (status.body.builds[0])? (status.body.builds[0].building) ? 'Running' : 'Stopped' : 'Never built before';


            })

        }


        function startJob($event){


            Jenkins.startJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                if(status.statusCode === 401){

                    $scope.authenticationFailed = true;
                    AuthenticationService.ClearCredentials();

                    $timeout(function(){
                        jenkinsJobStatusPolling();

                    })

                }else {

                    Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                        $scope.jenkinsJobQueueWhy = status.body.inQueue ? status.body.queueItem.why : '';

                        $scope.jenkinsJobStatus = status.body.inQueue ? 'Queued' : (status.body.builds[0].building) ? 'Running' : 'Stopped'

                        var content = 'Job has been started';
                        var toast = $mdToast.simple()
                            .action('OK')
                            .highlightAction(true)
                            .position('top center')
                            .hideDelay(3000);

                        $mdToast.show(toast.content(content)).then(function (response) {
                        });

                    })
                }

            });



        }

        function stopJob($event){


            Jenkins.stopJob($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(){

                if(status.statusCode === 401){

                    $scope.authenticationFailed = true;
                    AuthenticationService.ClearCredentials();
                    jenkinsJobStatusPolling();

                }else {

                    Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                        $scope.jenkinsJobQueueWhy = status.body.inQueue ? status.body.queueItem.why : '';

                        $scope.jenkinsJobStatus = status.body.inQueue ? 'Queued' : (status.body.builds[0].building) ? 'Running' : 'Stopped';

                        var content = 'Job has been stopped';
                        var toast = $mdToast.simple()
                            .action('OK')
                            .highlightAction(true)
                            .position('top center')
                            .hideDelay(3000);

                        $mdToast.show(toast.content(content)).then(function (response) {
                        });

                    })
                }

            });
        }

        function jenkinsJobConfig(url) {

            Products.get($stateParams.productName).success(function (product) {

                var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/configure';
                $window.open(url, '_blank');
            });

        };

        function jenkinsJobConsole($event){


            Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                if (status.statusCode === 401) {

                    $scope.authenticationFailed = true;
                    AuthenticationService.ClearCredentials();
                    if (Utils.polling !== undefined) $interval.cancel(Utils.polling);
                    //jenkinsJobStatusPolling();

                    var content = 'Authentication failed';
                    var toast = $mdToast.simple()
                        .action('OK')
                        .highlightAction(true)
                        .position('top center')
                        .hideDelay(3000);

                    $mdToast.show(toast.content(content)).then(function (response) {
                    });

                } else {
                    Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function (status) {

                        Products.get($stateParams.productName).success(function (product) {

                            var url = product.jenkinsHost + '/job/' + $scope.dashboard.jenkinsJobName + '/' + status.body.builds[0].number + '/console';
                            $window.open(url, '_blank');

                        });
                    })
                }
            });
        }

        function signin($event){


            /* if not already set, show dialog to get user and password */


                var parentEl = angular.element(document.body);
                $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    preserveScope: true,
                    templateUrl: 'modules/dashboards/views/jenkins-credentials.dialog.client.view.html',
                    scope: $scope,
                    //locals: {
                    //    jenkinsJobs: $scope.metric.targets[$scope.index],
                    //    index: $scope.index
                    //},
                    onComplete: function () {
                        setTimeout(function () {
                            //document.querySelector('#jenkinsJobAutoComplete').focus();
                        }, 1);
                    },
                    controller: DialogController
                });

                function DialogController($scope, $mdDialog, Jenkins, $stateParams) {


                    $scope.closeDialogCancel = function ($event) {

                        AuthenticationService.ClearCredentials();
                        $mdDialog.cancel();
                    }




                    $scope.login = function () {

                        AuthenticationService.SetCredentials($scope.user, $scope.password);

                        Jenkins.getJobStatus($stateParams.productName, $scope.dashboard.jenkinsJobName).success(function(loginResult){

                            if(loginResult.statusCode === 200){

                                $scope.authenticationFailed = false;
                                jenkinsJobStatusPolling();
                                if(Utils.polling === undefined) Utils.polling =  $interval(jenkinsJobStatusPolling, 15000);
                                $mdDialog.hide();

                            }else{

                                AuthenticationService.ClearCredentials();
                                $scope.authenticationFailed = true;
                                $mdDialog.hide();
                                var content = 'Authentication failed';
                                var toast = $mdToast.simple()
                                    .action('OK')
                                    .highlightAction(true)
                                    .position('top center')
                                    .hideDelay(3000);

                                $mdToast.show(toast.content(content)).then(function (response) {
                                });



                            }


                        })


                    }
                }

        }
    }
}

