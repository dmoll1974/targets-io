'use strict';

angular.module('import-db').controller('ImportDbController', ['$scope', 'FileUpload','Products', 'SideMenu', '$location', function($scope, FileUpload, Products, SideMenu, $location){

	$scope.uploadFile = function(uploadUrl){
		var file = $scope.myFile;
		//console.log('file is ' + JSON.stringify(file));
		FileUpload.uploadFileToUrl(file, uploadUrl).then(function(){

			Products.fetch().success(function(products){

				SideMenu.addProducts(products);

				$location.path('/#!/');

			});
		});
	};



}]);
