'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  '$location',
  '$http',
  '$window',
  '$state',
  'Dashboards',
  'Products',
  'TestRuns',
  '$stateParams',
  '$filter',
  function ($scope, Authentication, Menus, $location, $http, $window, $state, Dashboards, Products, TestRuns, $stateParams, $filter) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      //$scope.product = null;
      //$scope.dashboard = null;
      Products.fetch().success(function (products) {

        $scope.products = products;

        if($stateParams.productName) {

          var productIndex = $scope.products.map(function(product){return product.name;}).indexOf($stateParams.productName);
          $scope.product = $scope.products[productIndex];


          if($stateParams.dashboardName) {

              var dashboardIndex = $scope.product.dashboards.map(function(dashboard){return dashboard.name;}).indexOf($stateParams.dashboardName);
              $scope.dashboard = $scope.product.dashboards[dashboardIndex];
          }else{
              $scope.dashboard = null;
              $scope.dashboardSearchText = '';
          }
        }




      });
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



    $scope.selectedProductChange = function(product){

        Products.selected = product;


        if(product) {
          if (!$stateParams.dashboardName) {

            $scope.dashboardSearchText = null;
            $scope.dashboard = null;
            $state.go('viewProduct', {productName: product.name});
          }
        }else{
          $state.go('home');
        }
    }

    $scope.selectedDashboardChange = function(dashboard){


      if(dashboard) {
        if (!$stateParams.testRunId) {
          $state.go('viewDashboard', {productName: $scope.product.name, dashboardName: dashboard.name});
        }
      }else {
        $state.go('viewProduct', {productName: $scope.product.name});
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

    /* get productName an dashboardName form $stateParams in case of deeplink */
    setTimeout(function(){
        if ($stateParams.productName) {
          $scope.header = $stateParams.productName;
        }
        if ($stateParams.dashboardName) {
          $scope.header += ('-' + $stateParams.dashboardName);
        }
        if ($stateParams.productRelease) {
          $scope.header += ('-' + $stateParams.productRelease);
        }


    },0);

    //$scope.$watch(function (scope) {
    //  return Dashboards.selected.name;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //    if($stateParams.productName){
    //      $scope.header = $stateParams.productName ;
    //    }
    //    if($stateParams.dashboardName){
    //      $scope.header += ('-' + $stateParams.dashboardName);
    //    }
    //    if($stateParams.productRelease){
    //      $scope.header += ('-' + $stateParams.productRelease);
    //    }
    //  }
    //});

    //$scope.$watch(function (scope) {
    //  return Products.selected.name;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //      if($stateParams.productName){
    //        $scope.header = $stateParams.productName ;
    //      }
    //      if($stateParams.dashboardName){
    //        $scope.header += ('-' + $stateParams.dashboardName);
    //      }
    //      if($stateParams.productRelease){
    //        $scope.header += ('-' + $stateParams.productRelease);
    //      }
    //  }
    //});



    $scope.goHome = function(){

      $scope.dashboard = null;
      $scope.dashboardSearchText = null;
      $scope.product = null;
      $scope.productSearchText = null;
      $state.go('home');


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
]);
