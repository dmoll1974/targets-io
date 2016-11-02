'use strict';

angular.module('products').directive('editProductRequirement', EditProductRequirementDirective);

function EditProductRequirementDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-requirements/edit-product-requirement.client.view.html',
    controller: EditProductRequirementDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditProductRequirementDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {


    $scope.submit = submit;
    $scope.removeDashboard = removeDashboard;
    $scope.addRelatedDashboards = addRelatedDashboards;
    $scope.cancel = cancel;

      /* activate */

    activate();

    /* functions */

    function activate() {

      $scope.product = Products.selected;

      $scope.requirement = Products.selectedRequirement;


      $scope.requirement.relatedDashboards = $scope.requirement.relatedDashboards ? $scope.requirement.relatedDashboards : [''];

    }

    function submit(requirement) {

      var updateIndex = $scope.product.requirements.map(function(requirement){ return requirement.description}).indexOf(Products.selectedRequirement.description);

      $scope.product.requirements[updateIndex] = $scope.requirement;

      Products.update($scope.product).success(function(product ) {

        Products.selected = product;
        $state.go('productRequirements',{productName: product.name});

      });

    }

    function removeDashboard(index){

      $scope.requirement.relatedDashboards.splice(index, 1);

    }

    function addRelatedDashboards() {
      $scope.requirement.relatedDashboards.push('');
    };

    function cancel() {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
