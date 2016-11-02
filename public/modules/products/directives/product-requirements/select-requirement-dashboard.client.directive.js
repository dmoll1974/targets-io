'use strict';

angular.module('products').directive('selectRequirementDashboard', SelectRequirementDashboardDirective);

function SelectRequirementDashboardDirective () {

  var directive = {
    scope: {
      dashboard: '='
    },
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-requirements/select-requirement-dashboard.client.view.html',
    controller: SelectRequirementDashboardDirectiveController//,
    //controllerAs: 'ctrlWilyExportData'
  };

  return directive;

  /* @ngInject */
  function SelectRequirementDashboardDirectiveController ($scope, $state, $stateParams,  Dashboards, Products) {


    $scope.openMenu = openMenu;
    $scope.selectDashboard = selectDashboard;

      /* activate */

    activate();

    /* functions */

    function activate() {


      $scope.dashboards = [];

      _.each(Products.selected.dashboards, function (dashboard) {

        $scope.dashboards.push(dashboard.name);

      })
    }

      var originatorEv;
    function openMenu($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
      };



    function selectDashboard(index){

      $scope.dashboard = $scope.dashboards[index];
    }


  }
}
