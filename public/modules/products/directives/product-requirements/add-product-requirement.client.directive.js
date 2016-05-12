'use strict';

angular.module('products').directive('addProductRequirement', AddProductRequirementDirective);

function AddProductRequirementDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-requirements/add-product-requirement.client.view.html',
    controller: AddProductRequirementDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddProductRequirementDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {

    $scope.product = Products.selected;

    $scope.requirement = {};
    $scope.requirement.relatedDashboards = [];
    $scope.requirement.relatedDashboards.push('');

    $scope.addRelatedDashboards = function () {
      $scope.requirement.relatedDashboards.push('');
    };


    $scope.create = function(requirement) {

      $scope.product.requirements.push(requirement);

      Products.update($scope.product).success(function(product ) {

        Products.selected = product;
        $state.go('productRequirements',{productName: product.name});

      });
    }

    $scope.removeDashboard = function(index){

      $scope.requirement.relatedDashboards.splice(index, 1);

    }

    $scope.cancel = function () {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
