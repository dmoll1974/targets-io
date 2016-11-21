'use strict';

angular.module('products').directive('addProduct', AddProductDirective);

function AddProductDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product/add-product.client.view.html',
    controller: AddProductDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddProductDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {


    $scope.create = create;
    $scope.cancel = cancel;

      /* activate */
    activate();

    /* functions */

    function activate() {

      $scope.product = {};
      $scope.triedToSubmit = false;

      setTimeout(function () {
        document.querySelector('#productName').focus();
      }, 1);

    }


    function create () {
      // Create new Product object
      var product = {};
      product.name = this.product.name;
      product.description = this.product.description;
      Products.create(product).then(function (response) {
        Products.fetch().success(function (products) {
          Products.items = products;
          $scope.products = products;
          $state.go('viewProduct', { productName: response.data.name });
          $scope.productForm.$setPristine();
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    function cancel() {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
