'use strict';

angular.module('products').directive('editProduct', EditProductDirective);

function EditProductDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product/edit-product.client.view.html',
    controller: EditProductDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditProductDirectiveController ($scope, $state, $stateParams, TestRuns, Events, Products, Dashboards, $filter, $rootScope) {


    $scope.update = update;
    $scope.cancel = cancel;

      /* activate */
    activate();

    /* functions */

    function activate() {

      $scope.triedToSubmit = false;

      Products.get($stateParams.productName).success(function (product) {
        Products.selected = product;
        $scope.product = Products.selected;
      });

    }


    function update() {

      Products.update($scope.product).success(function (product) {

        if($scope.product.name !== Products.selected.name) {

          TestRuns.updateAllTestRunsForProduct($state.params.productName, product.name).success(function (testruns) {

            TestRuns.list = testruns;

            Events.updateAllEventsForProduct($state.params.productName, product.name).success(function (events) {

              Events.list = events;

              /* Refresh products */
              Products.fetch().success(function (products) {
                Products.items = products;
                $scope.products = products;

                $state.go('viewProduct', {productName: product.name});

              });
            });
          });
        }else{

          $state.go('viewProduct',{productName: product.name});
        }
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
