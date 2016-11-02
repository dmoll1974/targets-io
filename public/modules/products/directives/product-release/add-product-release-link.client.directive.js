'use strict';

angular.module('products').directive('addProductReleaseLink', AddProductReleaseLinkDirective);

function AddProductReleaseLinkDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-release/add-product-release-link.client.view.html',
    controller: AddProductReleaseLinkDirectiveController
  };

  return directive;

  /* @ngInject */
  function AddProductReleaseLinkDirectiveController ($scope, $state, Products, Dashboards, $filter, $rootScope) {


    $scope.create = create;
    $scope.cancel = cancel;

      /* activate */
    activate();

    /* functions */

    function activate() {

      $scope.link = {};
      $scope.link.openInNewTab = true;
      $scope.product = Products.selectedRelease;
      $scope.product.releaseLinks = $scope.product.releaseLinks ? $scope.product.releaseLinks : [];

    }


    function create(requirement) {

      $scope.product.releaseLinks.push($scope.link);

      Products.updateProductRelease($scope.product).success(function (productRelease) {

        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);


      })


    }


    function cancel() {
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
  }
}
