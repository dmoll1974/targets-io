'use strict';
angular.module('core').controller('UploadController', [
  '$scope',
  'Authentication',
  'Upload',
  'Products',
  'SideMenu',
  function ($scope, Authentication, Upload, Products, SideMenu) {
    $scope.uploadFile = function (uploadUrl) {
      var file = $scope.myFile;
      console.log('file is ');
      console.dir(file);
      Upload.uploadFileToUrl(file, uploadUrl).then(function () {
        Products.fetch().success(function (products) {
          SideMenu.addProducts(products);
        });
      });
    };
  }
]);