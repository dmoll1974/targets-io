'use strict';

angular.module('products').directive('editProductRequirement', EditProductRequirementDirective);

function EditProductRequirementDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/edit-product-requirement.client.view.html',
    controller: EditProductRequirementDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditProductRequirementDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {

    $scope.product = Products.selected;

    $scope.requirement = Products.selectedRequirement;

    $scope.submit = function(requirement) {

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
