'use strict';

angular.module('products').directive('productReleaseDetails', ProductReleaseDetailsDirective);

function ProductReleaseDetailsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-release-details.client.view.html',
    controller: ProductReleaseDetailsDirectiveController
  };

  return directive;


  /* @ngInject */
  function ProductReleaseDetailsDirectiveController ($scope, $state, $stateParams,  Dashboards, $filter, $rootScope, Products, TestRuns, $modal, ConfirmModal, $mdToast) {

    $scope.editMode = false;


    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };


    Products.getProductRelease($stateParams.productName, $stateParams.productRelease).success(function(productRelease){

        if(productRelease){

          $scope.product = productRelease;
          $scope.releaseSaved = true;

        }else {

          $scope.releaseSaved = false;
          /* get product */
          Products.get($stateParams.productName).success(function (product) {

            $scope.product = product;
            $scope.product.productRelease = $stateParams.productRelease;

            /* get test runs for release */
            TestRuns.listTestRunsForProductRelease($scope.product.name, $stateParams.productRelease).success(function (testRuns) {


              /* match test runs to requirements */

              _.each($scope.product.requirements, function (requirement, i) {

                $scope.product.requirements[i].relatedTestRuns = [];

                _.each(requirement.relatedDashboards, function (dashboard) {

                  _.each(testRuns, function (testRun) {

                    if (testRun.dashboardName === dashboard) $scope.product.requirements[i].relatedTestRuns.push({
                      productName: testRun.productName,
                      dashboardName: testRun.dashboardName,
                      testRunId: testRun.testRunId
                    });

                  })

                })

              });

            });
          });
        }
    });


    $scope.toggleRequirementResult = function (index){

      $scope.product.requirements[index].result = !$scope.product.requirements[index].result;
    }

    $scope.submitProductRelease = function(){

      if($scope.editMode === false) {

        if ($scope.releaseSaved === false) {

          Products.addProductRelease($scope.product).success(function (productRelease) {

            $scope.releaseSaved = true;

          })

        } else {

          Products.updateProductRelease($scope.product).success(function (productRelease) {

            $scope.releaseSaved = true;

          })

        }
      }


    }

    $scope.openDeleteModal = function (size, product) {
      ConfirmModal.itemType = 'Delete saved results for release ';
      ConfirmModal.selectedItemDescription = product.productRelease;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        Products.deleteProductRelease(product).success(function () {


          $scope.releaseSaved = false;
          $scope.editMode = false;

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(6000);

          $mdToast.show(toast.content('Product release results deleted from db')).then(function(response) {

          });
          /* reload*/
          $state.go($state.current, {}, { reload: true });
        });
      }, function () {
      });
    };



  }
}
