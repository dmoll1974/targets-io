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
  function ($scope, Authentication, Menus, $location, $http, $window, $state, Dashboards, Products) {
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
