'use strict';

angular.module('products').directive('productReleaseDetails', ProductReleaseDetailsDirective);

function ProductReleaseDetailsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-release/product-release-details.client.view.html',
    controller: ProductReleaseDetailsDirectiveController
  };

  return directive;


  /* @ngInject */
  function ProductReleaseDetailsDirectiveController ($scope, $state, $stateParams,  Dashboards, $filter, $rootScope, Products, TestRuns, $modal, ConfirmModal, $mdToast, $location, $anchorScroll, $timeout) {

      $scope.openMenu = openMenu;
      $scope.reloadProductRelease = reloadProductRelease;
      $scope.addLink = addLink;
      $scope.removeLink = removeLink;
      $scope.submitProductRelease = submitProductRelease;
      $scope.scrollTo = scrollTo;
      $scope.openDeleteModal = openDeleteModal;
      $scope.hasFlash = hasFlash;
      $scope.clipClicked = clipClicked;
      $scope.setProductReleaseUrl = setProductReleaseUrl;
      /* watches */

      var converter = new showdown.Converter({extensions: ['targetblank']});

      $scope.$watch('product.markDown', function (newVal, oldVal) {

          if (newVal !== undefined){

              var markDownToHTML = converter.makeHtml(newVal);

              $timeout(function () {

                  document.getElementById('markdown').innerHTML = markDownToHTML;

              }, 100);

          }
      });

      $scope.$watchCollection('product.releaseTestRuns', function (newVal, oldVal) {
          if (newVal !== oldVal && oldVal) {
              $scope.updated = true;
          }
      }, true);

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
                  //$state.go($rootScope.previousState, $rootScope.previousStateParams);
              });
          }
      });


      /* activate */

      activate();

      /* functions */

      function activate() {

          /* if coming from add link screen, set edit mode and updated to true */
          $scope.editMode = $rootScope.previousState.includes('addProductReleaseLink') ? true : false;
          $scope.updated = $rootScope.previousState.includes('addProductReleaseLink') ? true : false;
          $scope.testRunIndexItems = [];
          $scope.releaseTestRunsIndex = [];

          Products.getProductRelease($stateParams.productName, $stateParams.productRelease).success(function(response){

              if(response.productRelease){

                  $scope.product = response.productRelease;
                  $scope.releaseSaved = true;

                  /* add test runs to index */
                  _.each($scope.product.releaseTestRuns, function (testRun) {

                      Dashboards.get(testRun.productName, testRun.dashboardName).success(function (dashboard) {

                          $scope.testRunIndexItems.push({testRunId: testRun.testRunId, description: dashboard.description, end: testRun.end });

                      });
                  });

                  if(response.hasBeenUpdated) {
                      $scope.updated = true;
                      $scope.editMode = true;

                      var toast = $mdToast.simple()
                          .action('OK')
                          .highlightAction(true)
                          .position('top center')
                          .hideDelay(6000);

                      $mdToast.show(toast.content('Release report was updated based on updated data, save to persist!')).then(function (response) {

                      });
                  }



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

                  createProductReleaseDetails();

              }
          });


      }


      var originatorEv;
      function openMenu($mdOpenMenu, ev) {
          originatorEv = ev;
          $mdOpenMenu(ev);
      };



    function createProductReleaseDetails(){

      /* get product */
      Products.get($stateParams.productName).success(function (product) {


        $scope.product = product;
        $scope.product.productRelease = $stateParams.productRelease;


        /* get test runs for release */
        TestRuns.listTestRunsForProductRelease($scope.product.name, $stateParams.productRelease).success(function (testRuns) {

            $scope.product.releaseTestRuns = testRuns;

          _.each(testRuns, function (testRun) {

            Dashboards.get(testRun.productName, testRun.dashboardName).success(function (dashboard) {

              /* create index */

                $scope.testRunIndexItems.push({testRunId: testRun.testRunId, description: dashboard.description, end: testRun.end });

                testRun.requirements = [];

                _.each($scope.product.requirements, function (requirement, i) {

                    /* set requirements results to false */
                    requirement.result = false;

                    _.each(requirement.relatedDashboards, function (dashboard) {

                        if (testRun.dashboardName === dashboard) {

                          testRun.requirements.push(requirement);
                          testRun.description = dashboard.description;
                        }

                    });

                });
            });

          });
        });
      });

    }

    function reloadProductRelease(){

      createProductReleaseDetails(true);

      $scope.releaseSaved = false;

      var toast = $mdToast.simple()
          .action('OK')
          .highlightAction(true)
          .position('top')
          .hideDelay(10000)
          //.parent(angular.element('#fixedBaselineToast'))
          .theme('error-toast');

      $mdToast.show(toast.content('Test runs and requirements have reloaded, please set requirement results again!')).then(function (response) {

      });

    }

    function addLink(){

      $scope.updated = true;
      Products.selectedRelease = $scope.product;
      $state.go('addProductReleaseLink', {productName: $stateParams.productName, productRelease: $stateParams.productRelease});

    }

    function removeLink(index){

      $scope.updated = true;
      $scope.product.releaseLinks.splice(index,1);
    }



    function submitProductRelease(){

      submitProductRelease();
    }

    function  submitProductRelease() {

      if ($scope.releaseSaved === false) {

        /* clear id to prevent duplicate key errors */
        $scope.product._id = undefined;

        Products.addProductRelease($scope.product).success(function (productRelease) {

          $scope.releaseSaved = true;
          $scope.updated = false;

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(3000);

          $mdToast.show(toast.content('Product release results stored in database')).then(function (response) {

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


    function scrollTo(id) {
      $location.hash(id);
      $anchorScroll();
    }

    function openDeleteModal(size, product) {
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

      function hasFlash() {
          var hasFlash = false;
          try {
              var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
              if (fo) {
                  hasFlash = true;
                  return hasFlash;
              }
          } catch (e) {
              if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                  hasFlash = true;
                  return hasFlash;
              }
          }
      };

      /* Zero copied logic */
      function clipClicked() {
          $scope.productReleaseUrl = false;
      };

      /* generate deeplink to share view */

      function setProductReleaseUrl() {

          $scope.productReleaseUrl = 'http://' + location.host + '/#!/product-release-details/' + $stateParams.productName + '/' + $stateParams.productRelease +  '/' ;

      };




  }
}
