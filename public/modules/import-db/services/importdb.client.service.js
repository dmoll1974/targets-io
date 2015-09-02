'use strict';

angular.module('import-db').factory('FileUpload', ['$http',
	function ($http) {

		var  FileUpload = {
			uploadFileToUrl: uploadFileToUrl

		};

		return FileUpload;

		function uploadFileToUrl  (file, uploadUrl){
			var fd = new FormData();
			fd.append('file', file);
			$http.post(uploadUrl, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			})
				.success(function(){
				})
				.error(function(){
				});
		}
	}
]);
