'use strict';

angular.module('products').directive('productRequirements', ProductRequirementsDirective);

function ProductRequirementsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-requirements/product-requirements.client.view.html',
    controller: ProductRequirementsDirectiveController
  };

  return directive;


  /* @ngInject */
  function ProductRequirementsDirectiveController ($scope, $state,  Dashboards, $filter, $rootScope, Products, ConfirmModal, $modal, $stateParams) {


    $scope.openMenu = openMenu;
    $scope.cloneRequirements = cloneRequirements;
    $scope.addRequirement = addRequirement;
    $scope.editRequirement = editRequirement;
    $scope.setRequirementSelected = setRequirementSelected;
    $scope.setAllRequirementsSelected = setAllRequirementsSelected;
    $scope.openDeleteSelectedRequirementsModal = openDeleteSelectedRequirementsModal;


      /* Watches */

    $scope.$watch('allRequirementsSelected', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        _.each($scope.product.requirements, function (requirement, i) {
          requirement.selected = newVal;
        });
      }
    });


    /* activate */

    activate();

    /* functions */

    function activate() {


      Products.fetch().success(function (products) {

        $scope.productsWithRequirements = [];

        _.each(products, function (product) {

          if (product.requirements.length > 0) $scope.productsWithRequirements.push({
            product: product.name,
            requirements: product.requirements
          });
        });

      })

      Products.get($stateParams.productName).success(function (product) {

        $scope.product = product;
        Products.selected = product;

      });
    }

    var originatorEv;
    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };


    function cloneRequirements(product){

      /* add cloned requirements */
      _.each(product.requirements, function(requirement){

        $scope.product.requirements.push(requirement);

      })

      /* update product */
      Products.update($scope.product).success(function(product ) {


      });
    }

    function addRequirement(){

      $state.go('addProductRequirement', {productName: $scope.product.name});

    }
    function editRequirement(index){

      Products.selectedRequirement = $scope.product.requirements[index];
      $state.go('editProductRequirement', {productName: $scope.product.name});

    }


    function setRequirementSelected(requirementSelected){

      if (requirementSelected === false){

        $scope.requirementSelected = false;

        _.each($scope.product.requirements, function(requirement){
          if(requirement.selected === true) $scope.requirementSelected = true;
        })

      }else {
        $scope.requirementSelected = requirementSelected;
      }
    };

    function setAllRequirementsSelected(requirementSelected){

      $scope.requirementSelected = requirementSelected;
    };

    function openDeleteSelectedRequirementsModal(size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected requirements';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var i;

        for(i = $scope.product.requirements.length -1; i > -1; i--){

          if($scope.product.requirements[i].selected === true){
            $scope.product.requirements[i].selected = false;
            $scope.product.requirementSelected = false;
            $scope.product.requirements.splice(i,1);
          }
        }


        /* update product */
        Products.update($scope.product).success(function(product ) {

            $scope.requirementSelected = false;
        });


      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };

  }
}
