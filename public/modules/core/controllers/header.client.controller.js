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
  function ($scope, Authentication, Menus, $location, $http, $window, $state, Dashboards, Products, $stateParams) {
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
      if($stateParams.productName)  $scope.productName = $stateParams.productName;
      if($stateParams.dashboardName)  $scope.dashboardName = $stateParams.dashboardName;
    },0);

    $scope.$watch(function (scope) {
      return Dashboards.selected.name;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.dashboardName = Dashboards.selected.name;
      }
    });

    $scope.$watch(function (scope) {
      return Products.selected.name;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.productName = Products.selected.name;
      }
    });


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
