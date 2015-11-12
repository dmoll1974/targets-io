'use strict';
// Products controller
angular.module('products').controller('ProductsController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$state',
  '$location',
  '$modal',
  '$interval',
  'Products',
  'ConfirmModal',
  'SideMenu',
  'TestRuns',
  function ($scope, $rootScope, $stateParams, $state, $location, $modal, $interval, Products, ConfirmModal, SideMenu, TestRuns) {

    $scope.productName = $stateParams.productName;

    /* refresh test runs every 30 seconds */


    var testRunPolling = function(){
      TestRuns.listTestRunsForProduct($scope.productName).success(function (testRuns) {

        $scope.testRuns= [];
        $scope.testRuns= testRuns;
        $scope.numberOfTestRuns = testRuns.length;
        $scope.totalDuration = calculateTotalDuration(testRuns);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };

    function calculateTotalDuration(testRuns){

      var totalDuration = 0;

      _.each(testRuns, function(testRun){

        totalDuration += testRun.duration;
      })


      return(humanReadbleDuration(totalDuration));
    }

    function humanReadbleDuration(durationInMs){

      var date = new Date(durationInMs);
      var readableDate = '';
      if(date.getUTCDate()-1 > 0) readableDate += date.getUTCDate()-1 + " days, ";
      if(date.getUTCHours() > 0) readableDate += date.getUTCHours() + " hours, ";
      readableDate += date.getUTCMinutes() + " minutes";
      return readableDate;
    }

    testRunPolling();
    var polling = $interval(testRunPolling, 30000);

    $scope.testRunDetails = function (productName, dashboardName, testRunId) {
      $state.go('viewGraphs', {
        'productName': productName,
        'dashboardName': dashboardName,
        'testRunId': testRunId,
        'tag' : 'Load'
      });
    };

    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      $interval.cancel(polling);
    });

    $scope.initCreateForm = function () {
      /* reset form */
      $scope.product = {};
    };
    $scope.product = Products.selected;


    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    // Edit Product
    $scope.editProduct = function (productName) {
      $state.go('editProduct', { productName: productName });
    };

    // Create new Product
    $scope.create = function () {
      // Create new Product object
      var product = {};
      product.name = this.product.name;
      product.description = this.product.description;
      Products.create(product).then(function (response) {
        Products.fetch().success(function (products) {
          SideMenu.addProducts(products);
          $scope.products = Products.items;
          $state.go('viewProduct', { productName: response.data.name });
          $scope.productForm.$setPristine();
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Edit Product
    $scope.edit = function (productName) {
      $state.go('editProduct', { productName: productName });
    };
    $scope.update = function () {
      Products.update($scope.product).then(function (product) {
        /* Refresh sidebar */
        Products.fetch().success(function (product) {
          $scope.products = Products.items;
          SideMenu.addProducts($scope.products);
        });
        if ($rootScope.previousStateParams)
          $state.go($rootScope.previousState, $rootScope.previousStateParams);
        else
          $state.go($rootScope.previousState);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Products
    $scope.find = function () {
      $scope.products = Products.query();
    };
    // Find existing Product
    $scope.findOne = function () {
      Products.get($stateParams.productName).success(function (product) {
        Products.selected = product;
        $scope.product = Products.selected;
      });
    };
    // Add dashboard to Product
    $scope.addDashboard = function (product) {
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
          /* Refresh sidebar */
          Products.fetch().success(function (products) {
            $scope.products = Products.items;
          });
          $state.go('home');
        });
      }, function () {
      });
    };
  }
]);
