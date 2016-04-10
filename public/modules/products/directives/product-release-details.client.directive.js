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
  function ProductReleaseDetailsDirectiveController ($scope, $state, $stateParams,  Dashboards, $filter, $rootScope, Products, TestRuns, $modal, ConfirmModal, $mdToast, $location, $anchorScroll) {

    $scope.editMode = false;
    $scope.testRunIndexItems = [];
    $scope.releaseTestRunsIndex = [];

    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };


    Products.getProductRelease($stateParams.productName, $stateParams.productRelease).success(function(productRelease){

        if(productRelease){

          $scope.product = productRelease;
          $scope.releaseSaved = true;


          /* add test runs to index */
          _.each($scope.product.releaseTestRuns, function (testRun) {

            Dashboards.get(testRun.productName, testRun.dashboardName).success(function (dashboard) {

                $scope.testRunIndexItems.push({testRunId: testRun.testRunId, description: dashboard.description, end: testRun.end });

            });
          });

        }else {

          $scope.releaseSaved = false;
          /* get product */
          Products.get($stateParams.productName).success(function (product) {

            $scope.product = product;
            $scope.product.productRelease = $stateParams.productRelease;

            /* get test runs for release */
            TestRuns.listTestRunsForProductRelease($scope.product.name, $stateParams.productRelease).success(function (testRuns) {

              $scope.product.releaseTestRuns = testRuns;

              /* match test runs to requirements */

              _.each($scope.product.releaseTestRuns, function (testRun) {

                /* add test runs to index */

                Dashboards.get(testRun.productName, testRun.dashboardName).success(function (dashboard) {

                  $scope.testRunIndexItems.push({testRunId: testRun.testRunId, description: dashboard.description, end: testRun.end });

                });


                testRun.requirements = [];

                _.each($scope.product.requirements, function (requirement, i) {

                  _.each(requirement.relatedDashboards, function (dashboard) {

                    if (testRun.dashboardName === dashboard) {
                      testRun.requirements.push(requirement);
                      testRun.description = dashboard.description;
                    }

                  })

                })

              });

            });
          });
        }
    });



    $scope.addLink = function(){

      Products.selectedRelease = $scope.product;
      $state.go('addProductReleaseLink', {productName: $stateParams.productName, productRelease: $stateParams.productRelease});

    }

    $scope.removeLink = function(index){

      $scope.product.releaseLinks.splice(index,1);
    }

    $scope.toggleRequirementResult = function (parentIndex, index){

      $scope.product.releaseTestRuns[parentIndex].requirements[index].result = !$scope.product.releaseTestRuns[parentIndex].requirements[index].result;
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

    $scope.scrollTo = function(id) {
      $location.hash(id);
      $anchorScroll();
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
