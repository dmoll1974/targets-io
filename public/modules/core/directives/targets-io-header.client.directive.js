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
    function TargetsIoHeaderDirectiveController ($scope, $state, $stateParams, $interval, Products, Dashboards, Templates, ConfirmModal, $modal,$filter, $timeout) {

        $scope.$watch(function (scope) {
            return Dashboards.selected._id;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal && newVal) {
                $scope.dashboard = Dashboards.selected;
                $scope.dashboardSelected = true;
                $scope.dashboardSearchText = $scope.dashboard.name;
                Products.get($stateParams.productName).success(function (product) {
                    $scope.product = product;

                });
            }
        });


        $scope.$watch(function (scope) {
            return Products.items;
        }, function (newVal, oldVal) {
            if (newVal.length > 0) {

                $timeout(function(){
                    $scope.products = Products.items;

                    if($stateParams.productName) {

                        var productIndex = $scope.products.map(function(product){return product.name;}).indexOf($stateParams.productName);
                        $scope.product = $scope.products[productIndex];


                        if($stateParams.dashboardName) {

                            var dashboardIndex = $scope.product.dashboards.map(function(dashboard){return dashboard.name;}).indexOf($stateParams.dashboardName);
                            $scope.dashboard = $scope.product.dashboards[dashboardIndex];
                        }else{
                            $scope.$$childTail.dashboard = undefined;
                            $scope.$$childTail.dashboardSearchText = undefined;
                        }
                    }
                })
            }
        });


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

            $scope.dashboard = undefined;
            $state.go('viewProduct', {productName: product.name});

        };
        $scope.goToDashboardHome = function(product, dashboard){

            $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
        };

        $scope.selectedProductChange = function(product){

            Products.selected = product;



            if(product) {
                if (!$state.includes('productReleaseDetails') && !$state.includes('editProduct') && !$stateParams.dashboardName ) {

                    $scope.dashboardSelected = false;
                    $scope.dashboard = null;
                    $scope.dashboardSearchText = null;

                    $timeout(function(){

                        $scope.$$childTail.dashboard = undefined;
                        $scope.$$childTail.dashboardSearchText = undefined;
                        $state.go('viewProduct', {productName: product.name});

                    });
                }
            }else{

                $scope.dashboardSelected = false;
                $scope.dashboard = null;
                $scope.dashboardSearchText = undefined;


                $state.go('home');
            }
        }

        $scope.selectedDashboardChange = function(dashboard){


            if(dashboard) {
                $scope.dashboardSelected = true;
                $scope.dashboard = dashboard;
                if (!$stateParams.testRunId && !$state.includes('viewGraphs') && !$state.includes('viewLiveGraphs')) {
                    $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
                }
            }else {
                $scope.dashboardSelected = false;
                if(!$state.includes('viewProduct')) {
                    $state.go('viewProduct', {productName: $scope.product.name});
                }
            }
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


        var originatorEv;
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };
    }

}
