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
  function ProductReleasesDirectiveController ($scope, $state, $stateParams, Products, Dashboards, TestRuns, $filter, $rootScope) {

    $scope.productReleases =[];

    $scope.loadingReleases = true;

    TestRuns.listProductReleasesFromTestRuns($stateParams.productName).success(function(releases){

      $scope.loadingReleases = false;

      _.each(releases, function(release){

        if(release !== "")
          $scope.productReleases.push(release);

      });

    });




    $scope.releaseDetails = function(productRelease){

      Products.selected = $scope.product;
      Products.selected.productRelease = productRelease;

      $state.go('productReleaseDetails', {productName: $scope.product.name, productRelease: productRelease });

    }
  }
}
