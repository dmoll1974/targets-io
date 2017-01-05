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


        $scope.go = go;
        $scope.backup = backup;
        $scope.goToProductHome = goToProductHome;
        $scope.goToDashboardHome = goToDashboardHome;
        $scope.selectedProductChange = selectedProductChange;
        $scope.selectedDashboardChange = selectedDashboardChange;
        $scope.filterProducts = filterProducts;
        $scope.filterDashboards = filterDashboards;
        $scope.filterTestRuns = filterTestRuns;
        $scope.goHome = goHome;
        $scope.viewLiveGraphs = viewLiveGraphs;
        $scope.viewTrends = viewTrends;
        $scope.showTemplates = showTemplates;
        $scope.gettingStarted = gettingStarted;
        $scope.goToTestRunSummary = goToTestRunSummary;
        $scope.editTestRun = editTestRun;
        $scope.addDashboard = addDashboard;
        $scope.addProduct = addProduct;



        /* watches */

        $scope.$watch('productSearchText', function (val) {
            $scope.productSearchText = $filter('uppercase')(val);
        }, true);


        $scope.$watch('dashboardSearchText', function (val) {
            $scope.dashboardSearchText = $filter('uppercase')(val);
        }, true);





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


        $scope.$on('$stateChangeSuccess',function(){


            $timeout(function(){

                $scope.$state = $state;

                var dashboardViewUrlRegExp = new RegExp('browse/.*/.*/');

                $scope.dashboardView = dashboardViewUrlRegExp.test(window.location.href) ? true : false;
                $scope.graphsLiveView = (window.location.href.indexOf("graphs-live") != -1) ? true : false;
                $scope.graphsView = (window.location.href.indexOf("graphs/") != -1) ? true : false;


            })



        })




        /* activate */

        activate();

        /* functions */

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


        // Add Product
        function addProduct(productName) {
            $state.go('addProduct');


        };


        function addDashboard(){

            $state.go('addDashboard', {productName: $scope.product.name});
        }

        function go (path) {
            $location.path(path);
        };


        function backup () {
            var url = 'http://' + $window.location.host + '/download';
            //	$log.log(url);
            $window.location.href = url;
        };



         function goToProductHome(product){

            $scope.dashboard = null;

            $state.go('viewProduct', {productName: product.name});

        };

        function goToDashboardHome(product, dashboard){

            TestRuns.list = [];
            Dashboards.selectedTab = 0;
            $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
        };

        function selectedProductChange(product){


            /* reset tab */
            Utils.productSelectedIndex = 0;

            /* if product is selected */
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

                        //setTimeout(function(){
                        //    document.querySelector('#dashboardAutoComplete').focus();
                        //},0);

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
                'editDashboard',
                'importDbProduct',
                'viewTrends'


            ]

            var stateCheck = true;

            _.each(statesToCheck, function(stateToCheck){

                if(state === stateToCheck)stateCheck = false;

            })

            return stateCheck;
        }


        function selectedDashboardChange(dashboard){


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
                'visualBenchmark',
                'viewTrends'
            ]

            var stateCheck = true;

            _.each(statesToCheck, function(stateToCheck){

                if(state === stateToCheck)stateCheck = false;

            })

            return stateCheck;
        }

        function filterProducts (query) {
            var results = query ? $scope.products.filter( createFilterForProducts(query) ) : $scope.products;

            return results;

        }

        function filterDashboards (query) {
            var results = query ? $scope.product.dashboards.filter( createFilterForDashboards(query) ) : $scope.product.dashboards;

            return results;

        }


        function filterTestRuns(query) {
            var results = query ? $scope.testRuns.filter( createFilterForTestRuns(query) ) : $scope.testRuns;

            return results;

        }

        function createFilterForProducts(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(product) {
                return (product.name.indexOf(upperCaseQuery) !== -1);
            };
        }

        function createFilterForDashboards(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(dashboard) {
                return (dashboard.name.indexOf(upperCaseQuery) !== -1);
            };
        }

        function createFilterForTestRuns(query) {
            var upperCaseQuery = angular.uppercase(query);
            return function filterFn(testRun) {
                return (testRun.testRunId.indexOf(upperCaseQuery) === 0);
            };
        }

        function activate() {
            /* If dashboardName is in $stateParams in case of deeplink, set dashboardSelected to true */
            setTimeout(function () {

                if ($stateParams.dashboardName) {
                    $scope.dashboardSelected = true;
                }

                var dashboardViewUrlRegExp = new RegExp('browse/.*/.*/');

                $scope.dashboardView = dashboardViewUrlRegExp.test(window.location.href) ? true : false;
                $scope.graphsLiveView = (window.location.href.indexOf("graphs-live") != -1) ? true : false;
                $scope.graphsView = (window.location.href.indexOf("graphs/") != -1) ? true : false;

            }, 0);


        }

        function goHome(){



            $scope.dashboardSelected = false;
            $scope.dashboard = null;
            $scope.dashboardSearchText = null;


            $scope.product = null;
            $scope.productSearchText = null;


            $state.go('home');
            /* somehow currentState is not set after reloading the page, so set it manually*/
            $rootScope.currentState = 'home';



        }

        function viewLiveGraphs(){

            $state.go('viewLiveGraphs', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
            });
        }

        function viewTrends(){

            $state.go('viewTrends', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                tag: 'All'
            });
        }

        function showTemplates(){

            $state.go('viewTemplates');

        };

        function gettingStarted(){

            $state.go('gettingStarted');

        };

        function goToTestRunSummary(){

            $state.go('testRunSummary', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName,
                'testRunId': $stateParams.testRunId
            });

        }

        function editTestRun(){

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
