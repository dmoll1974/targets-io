'use strict';

angular.module('import-db').controller('ImportDbController', ['$scope', 'FileUpload', function($scope, FileUpload){

	$scope.uploadFile = function(){
		var file = $scope.myFile;
		//console.log('file is ' + JSON.stringify(file));
		var uploadUrl = "/upload";
		FileUpload.uploadFileToUrl(file, uploadUrl);
	};

	$scope.uploadFileLegacy = function(){
		var file = $scope.myFile;
		//console.log('file is ' + JSON.stringify(file));
		var uploadUrl = "/upload-legacy";
		FileUpload.uploadFileToUrl(file, uploadUrl);
	};

}]);
