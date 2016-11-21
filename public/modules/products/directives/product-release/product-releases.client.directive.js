'use strict';

angular.module('products').directive('productReleases', ProductReleasesDirective);

function ProductReleasesDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-release/product-releases.client.view.html',
    controller: ProductReleasesDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductReleasesDirectiveController ($scope, $state, $stateParams, Products, Dashboards, TestRuns, TestRunSummary, $filter, $rootScope) {

    $scope.productReleases =[];

    $scope.loadingReleases = true;

    TestRuns.listProductReleasesFromTestRuns($stateParams.productName).success(function(releases){



      _.each(releases, function(release){

        if(release !== "")
          $scope.productReleases.push({id: release});

      });

      /* Add stored test run summaries*/
      TestRunSummary.getTestRunSummaryReleasesForProduct($stateParams.productName).success(function(testRunSummaryReleases){

        $scope.loadingReleases = false;

        _.each(testRunSummaryReleases, function(release){

          if(release !== "" && ($scope.productReleases.map(function(producRelease){return productRelease.id;}).indexOf(release) !== -1 || $scope.productReleases.length === 0) )
            $scope.productReleases.push({id: release});

        });

      });
    });




    $scope.releaseDetails = function(productRelease){

      Products.selected = $scope.product;
      Products.selected.productRelease = productRelease;

      $state.go('productReleaseDetails', {productName: $scope.product.name, productRelease: productRelease.id });

    }
  }
}
