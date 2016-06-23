'use strict';

angular.module('core').directive('targetsIoHeader', TargetsIoHeaderDirective);

function TargetsIoHeaderDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/targets-io-header.client.view.html',
        controller: TargetsIoHeaderDirectiveController
    };

    return directive;

    /* @ngInject */
    function TargetsIoHeaderDirectiveController ($scope, $rootScope, $state, $stateParams, $location, $window, Products, Dashboards, Templates, TestRuns, ConfirmModal, $modal,$filter, $timeout, Utils, TargetsIoHeader) {

        $scope.$on('$stateChangeSuccess',function(){
            $scope.$state = $state;
        })



        //$scope.$watch(function (scope) {
        //    return Dashboards.selected._id;
        //}, function (newVal, oldVal) {
        //    if (newVal !== oldVal && newVal) {
        //        $scope.dashboard = Dashboards.selected;
        //        $scope.dashboardSelected = true;
        //        $scope.dashboardSearchText = $scope.dashboard.name;
        //        Products.get($stateParams.productName).success(function (product) {
        //            $scope.product = product;
        //
        //        });
        //    }
        //});
        // $scope.$watch(function (scope) {
        //    return Products.selected ;
        //}, function (newVal, oldVal) {
        //    if (newVal !== oldVal && newVal) {
        //
        //        $scope.product = newVal ;
        //
        //    }
        //});


        $rootScope.$watch('currentStateParams', function (newVal, oldVal) {
            //if (newVal !== oldVal) {

                fetchProducts(function(products){
                    $scope.products = Products.items;

                    if($rootScope.currentStateParams && $rootScope.currentStateParams.productName) {


                        var productIndex = $scope.products.map(function(product){return product.name;}).indexOf($rootScope.currentStateParams.productName);
                        $scope.product = $scope.products[productIndex];

                        if($rootScope.currentStateParams.dashboardName) {

                            /* if switching dashboards, reset application state */
                            if($rootScope.currentStateParams.dashboardName !== $rootScope.previousStateParams.dashboardName && $rootScope.previousStateParams.dashboardName) {
                                //TestRuns.list = [];
                                /* reset utils variables */
                                Utils.reset();

                            }

                            var dashboardIndex = $scope.product.dashboards.map(function(dashboard){return dashboard.name;}).indexOf($rootScope.currentStateParams.dashboardName);
                            $scope.dashboard = $scope.product.dashboards[dashboardIndex];

                        }else{
                            $scope.$$childTail.dashboard = null;
                            $scope.$$childTail.dashboardSearchText = null;
                            $scope.dashboard = null;
                            $scope.dashboardSearchText = null;

                        }
                    }
                });

            //}
        });

        function fetchProducts(callback){

            /* fetch products */

            if (!Products.items || Products.items.length === 0){
                Products.fetch().success(function (products) {
                    Products.items = products;
                    callback(products);
                });
            }else{
                callback(Products.items);
            }

        }


        $scope.go = function (path) {
            $location.path(path);
        };
        $scope.backup = function () {
            var url = 'http://' + $window.location.host + '/download';
            //	$log.log(url);
            $window.location.href = url;
        };





        $scope.$watch('productSearchText', function (val) {
            $scope.productSearchText = $filter('uppercase')(val);
        }, true);


        $scope.$watch('dashboardSearchText', function (val) {
            $scope.dashboardSearchText = $filter('uppercase')(val);
        }, true);

        $scope.goToProductHome = function(product){

            $scope.dashboard = null;

            $state.go('viewProduct', {productName: product.name});

        };
        $scope.goToDashboardHome = function(product, dashboard){

            TestRuns.list = [];
            Dashboards.selectedTab = 0;
            $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
        };

        $scope.selectedProductChange = function(product){


            if(product) {
                if (checkProductState($rootScope.currentState) && !$stateParams.dashboardName ) {



                    Products.selected = product;
                    $scope.dashboardSelected = false;
                    $scope.dashboard = null;
                    $scope.dashboardSearchText = null;

                    $timeout(function(){


                        $scope.$$childTail.dashboard = null;
                        $scope.$$childTail.dashboardSearchText = null;

                        $state.go('viewProduct', {productName: $scope.product.name});

                    });
                }
            }else{

                $scope.dashboardSelected = false;
                $scope.dashboard = null;
                $scope.dashboardSearchText = null;
                $scope.product = null;
                $scope.productSearchText = null;


                $state.go('home');
            }
        }

        function checkProductState(state){

            var statesToCheck =[
                'productReleaseDetails',
                'editProduct',
                'productRequirements',
                'addProductRequirement',
                'editProductRequirement',
                'addProductReleaseLink',
                'addDashboard',
                'editDashboard'
            ]

            var stateCheck = true;

            _.each(statesToCheck, function(stateToCheck){

                if(state === stateToCheck)stateCheck = false;

            })

            return stateCheck;
        }


        $scope.selectedDashboardChange = function(dashboard){


            if(dashboard) {
                $scope.dashboardSelected = true;
                $scope.dashboard = dashboard;
                if (checkDashboardState($rootScope.currentState)) {
                    TestRuns.list = [];

                    /* reset zoomRange for live graphs */
                    Utils.zoomRange = {
                        value: '-10min',
                        label: 'Last 10 minutes'
                    };
                    /* reset utils variables */
                    Utils.reset();

                    $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
                }
            }else {
                $scope.dashboardSelected = false;
                if(checkProductState($rootScope.currentState) && $rootScope.currentState !== 'home' ) {
                    $state.go('viewProduct', {productName: $stateParams.productName});
                }
            }
        }

        function checkDashboardState(state){

            var statesToCheck =[
                'viewGraphs',
                'viewLiveGraphs',
                'editDashboard',
                'manageDashboardTags',
                'addMetric',
                'editMetric',
                'requirementsTestRun',
                'benchmarkPreviousBuildTestRun',
                'benchmarkFixedBaselineTestRun',
                'addTestRun',
                'editTestRun',
                'testRunSummary',
                'visualBenchmark'
            ]

            var stateCheck = true;

            _.each(statesToCheck, function(stateToCheck){

                if(state === stateToCheck)stateCheck = false;

            })

            return stateCheck;
        }

        $scope.filterProducts = function (query) {
            var results = query ? $scope.products.filter( createFilterForProducts(query) ) : $scope.products;

            return results;

        }

        $scope.filterDashboards = function (query) {
            var results = query ? $scope.product.dashboards.filter( createFilterForDashboards(query) ) : $scope.product.dashboards;

            return results;

        }


        $scope.filterTestRuns = function (query) {
            var results = query ? $scope.testRuns.filter( createFilterForTestRuns(query) ) : $scope.testRuns;

            return results;

        }

        function createFilterForProducts(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(product) {
                return (product.name.indexOf(upperCaseQuery) === 0);
            };
        }

        function createFilterForDashboards(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(dashboard) {
                return (dashboard.name.indexOf(upperCaseQuery) === 0);
            };
        }

        function createFilterForTestRuns(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(testRun) {
                return (testRun.testRunId.indexOf(upperCaseQuery) === 0);
            };
        }

        /* If dashboardName is in $stateParams in case of deeplink, set dashboardSelected to true */
        setTimeout(function(){

            if ($stateParams.dashboardName) {
                $scope.dashboardSelected = true;
            }



        },0);



        $scope.goHome = function(){

            $scope.dashboardSelected = false;

            $scope.dashboard = null;
            $scope.dashboardSearchText = null;
            $scope.product = null;
            $scope.productSearchText = null;
            $state.go('home');


        }

        $scope.viewLiveGraphs = function(){

            $state.go('viewLiveGraphs', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
            });
        }

        $scope.showTemplates = function(){

            $state.go('viewTemplates');

        };

        $scope.gettingStarted = function(){

            $state.go('gettingStarted');

        };

        $scope.goToTestRunSummary = function(){

            $state.go('testRunSummary', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                'testRunId': $stateParams.testRunId
            });

        }

        $scope.editTestRun = function(){

            $state.go('editTestRun', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                'testRunId': $stateParams.testRunId
            });

        }




        var originatorEv;
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
    }

}
