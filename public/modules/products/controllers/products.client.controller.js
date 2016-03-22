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
  'Events',
  'Dashboards',
  function ($scope, $rootScope, $stateParams, $state, $location, $modal, $interval, Products, ConfirmModal, SideMenu, TestRuns, Events, Dashboards) {

    //setTimeout(function(){
    //  $scope.productName = $stateParams.productName;
      /* reset selected dashboard when accessing this page */
      Dashboards.selected = {};
    //  testRunPolling();
    //  //var polling = $interval(testRunPolling, 30000);
    //}, 1);


/* Products to trigger update of header scope in cas of deeplink */
    Products.fetch().success(function (products) {
      Products.items = products;

    });



    $scope.testRunDetails = function (productName, dashboardName, testRunId) {
      $state.go('viewGraphs', {
        'productName': productName,
        'dashboardName': dashboardName,
        'testRunId': testRunId,
        'tag' : 'Load'
      });
    };



    $scope.initCreateForm = function () {
      /* reset form */
      $scope.product = {};
    };
    $scope.product = Products.selected;



    // Create new Product
    $scope.create = function () {
      // Create new Product object
      var product = {};
      product.name = this.product.name;
      product.description = this.product.description;
      Products.create(product).then(function (response) {
        Products.fetch().success(function (products) {
          Products.items = products;
          SideMenu.addProducts(products);
          $scope.products = products;
          $state.go('viewProduct', { productName: response.data.name });
          $scope.productForm.$setPristine();
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.update = function () {

        Products.update($scope.product).success(function (product) {

          TestRuns.updateAllTestRunsForProduct($state.params.productName, product.name).success(function(testruns){

            TestRuns.list = testruns;

            Events.updateAllEventsForProduct($state.params.productName, product.name).success(function(events){

              Events.list = events;

                  /* Refresh sidebar */
              Products.fetch().success(function (products) {
                Products.items = products;
                $scope.products = products;
                SideMenu.addProducts(products);

                $state.go('viewProduct',{productName: product.name});

              });
            });
          });
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

  }
]);
