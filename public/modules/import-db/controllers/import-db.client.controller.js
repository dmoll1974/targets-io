'use strict';
angular.module('import-db').controller('ImportDbController', [
  '$scope',
  'FileUpload',
  'Products',
  'SideMenu',
  '$location',
  '$interval',
  '$state',
  function ($scope, FileUpload, Products, SideMenu, $location, $interval, $state) {
    var j = 0, counter = 0;
    var spinner;
    $scope.modes = [];
    $scope.activated = false;
    $scope.determinateValue = 30;
    $scope.$watch('activated', function (current, old) {
      if (current !== old) {
        if (current === true) {
          // Iterate every 100ms, non-stop
          spinner = $interval(function () {
            // Increment the Determinate loader
            $scope.determinateValue += 1;
            if ($scope.determinateValue > 100) {
              $scope.determinateValue = 30;
            }
            // Incrementally start animation the five (5) Indeterminate,
            // themed progress circular bars
            if (j < 5 && !$scope.modes[j] && $scope.activated) {
              $scope.modes[j] = 'indeterminate';
            }
            if (counter++ % 4 == 0)
              j++;
            console.log('bla');
          }, 100, 0, true);
        }
      }
    });
    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(spinner);
    });
    $scope.uploadFile = function (uploadUrl, targetState) {
      var file = $scope.myFile;
      $scope.activated = true;
      j = counter = 0;
      //console.log('file is ' + JSON.stringify(file));
      FileUpload.uploadFileToUrl(file, uploadUrl).then(function () {
        Products.fetch().success(function (products) {
          Products.items = products;
          SideMenu.addProducts(products);
          $state.go(targetState);
          $scope.activated = false;
        });
      });
    };
  }
]);
