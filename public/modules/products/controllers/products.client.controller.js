'use strict';

// Products controller
angular.module('products').controller('ProductsController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', '$modal', 'Products', 'ConfirmModal',
	function($scope, $rootScope, $stateParams, $state, $location, $modal, Products, ConfirmModal) {


        $scope.initCreateForm = function(){

            /* reset form */
            $scope.product = {};
        }
        $scope.product = Products.selected;

        // Create new Product
		$scope.create = function() {
			// Create new Product object
			var product = {};
            product.name = this.product.name;
            product.description = this.product.description;


            Products.create(product).then(function(response){

                Products.fetch().success(function(products){

                    $scope.products = Products.items;
                    $state.go('viewProduct', {productName: response.data.name});
                    $scope.productForm.$setPristine();

                });

			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};


		// Edit Product
		$scope.edit = function(productName) {

            $state.go('editProduct', {productName: productName})
        };

        $scope.update = function() {

            Products.update($scope.product).then(function (product) {

                /* Refresh sidebar */
                Products.fetch().success(function(product){
                    $scope.products = Products.items;

                });

                $state.go('viewProduct',{"productName":$scope.product.name});

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });

        };

		// Find a list of Products
		$scope.find = function() {
			$scope.products = Products.query();
		};

		// Find existing Product
		$scope.findOne = function() {

            Products.get($stateParams.productName).success(function(product){

                Products.selected = product;
                $scope.product = Products.selected;

            });

		};

        // Add dashboard to Product
        $scope.addDashboard = function(product) {

            $location.path('/dashboards/create/' + product._id);
        };

        $scope.cancel = function () {

            Products.selected = {};

            /* reset form*/
            $scope.productForm.$setPristine();


            if ($rootScope.previousStateParams)
                $state.go($rootScope.previousState, $rootScope.previousStateParams);
            else
                $state.go($rootScope.previousState);


        }


        $scope.openDeleteProductModal = function (size) {


            ConfirmModal.itemType = 'Delete product ';
            ConfirmModal.selectedItemId = Products.selected._id;
            ConfirmModal.selectedItemDescription = Products.selected.name;

            var modalInstance = $modal.open({
                templateUrl: 'ConfirmDelete.html',
                controller: 'ModalInstanceController',
                size: size//,
            });

        modalInstance.result.then(function (productName) {

            Products.delete(productName).success(function(product){

                /* reset slected Product*/

                Products.selected = {};

                /* Refresh sidebar */
                Products.fetch().success(function(products){
                    $scope.products = Products.items;

                });

                $state.go('home');

            });

        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };

}
]);
