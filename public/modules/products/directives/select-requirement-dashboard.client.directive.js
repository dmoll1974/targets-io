'use strict';

angular.module('products').directive('selectRequirementDashboard', SelectRequirementDashboardDirective);

function SelectRequirementDashboardDirective () {

  var directive = {
    scope: {
      dashboard: '='
    },
    restrict: 'EA',
    templateUrl: 'modules/products/directives/select-requirement-dashboard.client.view.html',
    controller: SelectRequirementDashboardDirectiveController//,
    //controllerAs: 'ctrlWilyExportData'
  };

  return directive;

  /* @ngInject */
  function SelectRequirementDashboardDirectiveController ($scope, $state, $stateParams,  Dashboards, Products) {

    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };



    $scope.dashboards = [];

    _.each(Products.selected.dashboards, function(dashboard){

      $scope.dashboards.push(dashboard.name);

    })





    $scope.selectDashboard = function (index){

      $scope.dashboard = $scope.dashboards[index];
    }


  }
}
