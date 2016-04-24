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

    $scope.product = Products.selected;

    $scope.requirement = Products.selectedRequirement;


    $scope.requirement.relatedDashboards = $scope.requirement.relatedDashboards ? $scope.requirement.relatedDashboards : [''];


    $scope.submit = function(requirement) {

      var updateIndex = $scope.product.requirements.map(function(requirement){ return requirement.description}).indexOf(Products.selectedRequirement.description);

      $scope.product.requirements[updateIndex] = $scope.requirement;

      Products.update($scope.product).success(function(product ) {

        Products.selected = product;
        $state.go('productRequirements',{productName: product.name});

      });

    }

    $scope.removeDashboard = function(index){

      $scope.requirement.relatedDashboards.splice(index, 1);

    }

    $scope.addRelatedDashboards = function () {
      $scope.requirement.relatedDashboards.push('');
    };

    $scope.cancel = function () {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
