'use strict';

angular.module('products').directive('productReleases', ProductReleasesDirective);

function ProductReleasesDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-releases.client.view.html',
    controller: ProductReleasesDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductReleasesDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {


    $scope.releaseDetails = function(productRelease){

      Products.selected = $scope.product;
      Products.selected.productRelease = productRelease;

      $state.go('productReleaseDetails', {productName: $scope.product.name, productRelease: productRelease.release });

    }
  }
}
