'use strict';

angular.module('products').directive('addProductRequirement', AddProductRequirementDirective);

function AddProductRequirementDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/add-product-requirement.client.view.html',
    controller: AddProductRequirementDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddProductRequirementDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {

    $scope.product = Products.selected;

    $scope.create = function(requirement) {

      $scope.product.requirements.push(requirement);

      Products.update($scope.product).success(function(product ) {

        Products.selected = product;
        $state.go('productRequirements',{productName: product.name});

      });
    }

    $scope.cancel = function () {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
