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
  '$stateParams',
  '$mdToast',
  'Utils',
  function ($scope, Authentication, Menus, $location, $http, $window, $state, Dashboards, Products, $stateParams, $mdToast, Utils) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
    $scope.go = function (path) {
      $location.path(path);
    };
    $scope.backup = function () {
      var url = 'http://' + $window.location.host + '/download';
      //	$log.log(url);
      $window.location.href = url;
    };



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

    $scope.$watch(function (scope) {
      return Dashboards.selected.name;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if($stateParams.productName){
          $scope.header = $stateParams.productName ;
        }
        if($stateParams.dashboardName){
          $scope.header += ('-' + $stateParams.dashboardName);
        }
        if($stateParams.productRelease){
          $scope.header += ('-' + $stateParams.productRelease);
        }
      }
    });

    $scope.$watch(function (scope) {
      return Products.selected.name;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {

          if($stateParams.productName){
            $scope.header = $stateParams.productName ;
          }
          if($stateParams.dashboardName){
            $scope.header += ('-' + $stateParams.dashboardName);
          }
          if($stateParams.productRelease){
            $scope.header += ('-' + $stateParams.productRelease);
          }
      }
    });



    $scope.goHome = function(){

      $scope.header = null;
      $state.go('home');


    }


    $scope.showTemplates = function(){

      $state.go('viewTemplates');

    };

    $scope.gettingStarted = function(){

      $state.go('gettingStarted');

    };

    $scope.flushGraphiteCache = function(){

        Utils.flushGraphiteCache().success(function(){

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Graphite cache has been flushed!')).then(function(response) {

          });
        })
    };



    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };
  }
]);
