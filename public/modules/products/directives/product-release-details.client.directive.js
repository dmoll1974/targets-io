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
  function ProductReleaseDetailsDirectiveController ($scope, $state, $stateParams,  Dashboards, $filter, $rootScope, Products, TestRuns) {


    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    /* get product */
    Products.get($stateParams.productName).success(function(product){

      $scope.product = product;
      $scope.product.productRelease = $stateParams.productRelease;

      /* get test runs for release */
      TestRuns.listTestRunsForProductRelease($scope.product.name, $stateParams.productRelease).success(function(testRunSummaries){

        $scope.productReleaseTestRuns = testRunSummaries;

      });

    });


    $scope.addTestRun = function(testRun, index){

      if(!$scope.product.requirements[index].ascociatedTestRuns) $scope.product.requirements[index].ascociatedTestRuns = [];


      $scope.product.requirements[index].ascociatedTestRuns.push(testRun);

    }


    $scope.toggleRequirementResult = function (index){

      $scope.product.requirements[index].result = !$scope.product.requirements[index].result;
    }

    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };


    $scope.cloneReleaseDetails = function(product){

      /* add cloned releaseDetails */
      _.each(product.releaseDetails, function(requirement){

        $scope.product.releaseDetails.push(requirement);

      })

      /* update product */
      Products.update($scope.product).success(function(product ) {


      });
    }
    $scope.product = Products.selected;

    $scope.addRequirement = function(){

      $state.go('addProductRequirement', {productName: $scope.product.name});

    }
    $scope.editRequirement = function(index){

      Products.selectedRequirement = $scope.product.releaseDetails[index];
      $state.go('editProductRequirement', {productName: $scope.product.name});

    }


    $scope.$watch('allReleaseDetailsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.releaseDetails, function (requirement, i) {
          requirement.selected = newVal;
        });
      }
    });

    $scope.setReleaseDetailsSelected = function(requirementSelected){

      if (requirementSelected === false){

        $scope.requirementSelected = false;

        _.each($scope.releaseDetails, function(requirement){
          if(requirement.selected === true) $scope.requirementSelected = true;
        })

      }else {
        $scope.requirementSelected = requirementSelected;
      }
    };

    $scope.setAllReleaseDetailsSelected = function(requirementSelected){

      $scope.requirementSelected = requirementSelected;
    };

    $scope.openDeleteSelectedReleaseDetailsModal = function (size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected releaseDetails';
      var modalInstance = $modal.open({
        requirementUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteRequirementArrayOfPromises = [];
        var i;

        for(i = $scope.releaseDetails.length -1; i > -1; i--){

          if($scope.releaseDetails[i].selected === true){
            deleteRequirementArrayOfPromises.push(ReleaseDetails.delete($scope.releaseDetails[i]._id));
            $scope.releaseDetails[i].selected = false;
            $scope.requirementSelected = false;
            $scope.releaseDetails.splice(i,1);
          }
        }


        $q.all(deleteRequirementArrayOfPromises)
            .then( ReleaseDetails.getAll())
            .success(function (releaseDetails) {
              $scope.releaseDetails = releaseDetails;
            });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

  }
}
