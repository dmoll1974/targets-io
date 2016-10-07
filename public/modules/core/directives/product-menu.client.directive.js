'use strict';

angular.module('core').directive('productMenu', ProductMenuDirective);

function ProductMenuDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/product-menu.client.view.html',
        controller: ProductMenuDirectiveController
    };

    return directive;

    /* @ngInject */
    function ProductMenuDirectiveController ($scope, $state, $interval, Products, ConfirmModal, $modal, $window, $location, $stateParams) {

        var originatorEv;
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        // Edit Product
        $scope.editProduct = function (productName) {
            $state.go('editProduct', { productName: productName });
        };

        // Add Product
        $scope.addProduct = function (productName) {
            $state.go('addProduct');
        };

        $scope.editProductRequirememts = function (productName){

            $state.go('productRequirements', {
                'productName': productName
            });

        }

        $scope.backupProduct = function(){

            var url = 'http://' + $window.location.host + '/download-product/' + $stateParams.productName;
            //	$log.log(url);
            $window.location.href = url;
        }

        $scope.restore = function () {
            $state.go('importDbProduct', {productName: $stateParams.productName });
        };

        $scope.openDeleteProductModal = function (size) {
            ConfirmModal.itemType = 'Delete product ';
            ConfirmModal.selectedItemId = Products.selected._id;
            ConfirmModal.selectedItemDescription = Products.selected.name;
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmDelete.html',
                controller: 'ModalInstanceController',
                size: size  //,
            });
            modalInstance.result.then(function (productName) {
                Products.delete(productName).success(function (product) {
                    /* reset slected Product*/
                    Products.selected = {};
                    /*update header product autocomplete*/
                    $scope.product = undefined;
                    /* Refresh sidebar */
                    Products.fetch().success(function (products) {
                        Products.items = products;
                        $scope.products = products;
                        $state.go('home');

                    });
                });
            }, function () {
            });
        };


    }
}
