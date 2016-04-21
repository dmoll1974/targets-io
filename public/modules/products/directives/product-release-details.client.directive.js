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

    /* if coming from add link screen, set edit mode and updated to true */
    $scope.editMode = $rootScope.previousState.includes('addProductReleaseLink')? true : false;
    $scope.updated = $rootScope.previousState.includes('addProductReleaseLink')? true : false;
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

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top')
              .hideDelay(30000)
              //.parent(angular.element('#fixedBaselineToast'))
              .theme('error-toast');

          $mdToast.show(toast.content('Release report has not been verified / saved!')).then(function (response) {

          });


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

                  /* set requirements results to false */
                  requirement.result = false;

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

      $scope.updated = true;
      Products.selectedRelease = $scope.product;
      $state.go('addProductReleaseLink', {productName: $stateParams.productName, productRelease: $stateParams.productRelease});

    }

    $scope.removeLink = function(index){

      $scope.updated = true;
      $scope.product.releaseLinks.splice(index,1);
    }

    $scope.$watch('product.releaseTestRuns', function (newVal, oldVal) {
      if (newVal !== oldVal && oldVal) {
        $scope.updated = true;
      }
    }, true);

    //$scope.toggleRequirementResult = function (parentIndex, index){
    //  $scope.updated = true;
    //  $scope.product.releaseTestRuns[parentIndex].requirements[index].result = !$scope.product.releaseTestRuns[parentIndex].requirements[index].result;
    //}

    $scope.submitProductRelease = function(){

      submitProductRelease();
    }

    function  submitProductRelease() {

      if ($scope.releaseSaved === false) {

        Products.addProductRelease($scope.product).success(function (productRelease) {

          $scope.releaseSaved = true;
          $scope.updated = false;

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Product release results saved to db')).then(function (response) {

          });

        })

      } else {

        Products.updateProductRelease($scope.product).success(function (productRelease) {

          $scope.releaseSaved = true;
          $scope.updated = false;


          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Product release results updated')).then(function (response) {

          });


        })

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
              .hideDelay(3000);

          $mdToast.show(toast.content('Product release results deleted from db')).then(function(response) {

          });
          /* reload*/
          $state.go($state.current, {}, { reload: true });
        });
      }, function () {
      });
    };


    $scope.$on('$destroy', function () {
      /* if updates have been made and not saved, prompt the user */
      if($scope.updated === true && !$rootScope.currentState.includes('addProductReleaseLink') && !$rootScope.currentState.includes('productReleaseDetails')){

        ConfirmModal.itemType = 'Save changes to ';
        ConfirmModal.selectedItemDescription = $scope.product.name + ' ' + $scope.product.productRelease;
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: ''  //,
        });
        modalInstance.result.then(function () {
          submitProductRelease();

        }, function () {

          /* return to previous state*/
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        });
      }
    });


  }
}
