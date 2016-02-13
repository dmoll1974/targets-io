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

    $scope.productName = $stateParams.productName;

    /* reset selected dashboard when accessing this page */
    Dashboards.selected = {};


    $scope.showNumberOfTestRuns = 10;

    $scope.$watch('showNumberOfTestRuns', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        testRunPolling();
      }
    });

    $scope.numberOfRowOptions = [
      {value: 10},
      {value: 20},
      {value: 30},
      {value: 40}
    ];



    /* refresh test runs every 30 seconds */


    var testRunPolling = function(){
      TestRuns.listTestRunsForProduct($scope.productName).success(function (testRuns) {

        $scope.testRuns= [];
        $scope.testRuns= testRuns;
        $scope.numberOfTestRuns = testRuns.length;
        $scope.totalDuration = TestRuns.calculateTotalDuration(testRuns);
        $scope.productReleases = getProductReleases(testRuns);

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });

    };



    testRunPolling();
    var polling = $interval(testRunPolling, 30000);


    function getProductReleases(testRuns){

      var productReleases = [];

      _.each(testRuns, function(testRun){

        if(testRun.productRelease && productReleases.map(function(productRelease){return productRelease.release}).indexOf(testRun.productRelease) === -1)
          productReleases.push({release: testRun.productRelease, date: testRun.end});
      })

      return productReleases;
    }

    $scope.testRunDetails = function (productName, dashboardName, testRunId) {
      $state.go('viewGraphs', {
        'productName': productName,
        'dashboardName': dashboardName,
        'testRunId': testRunId,
        'tag' : 'Load'
      });
    };

    $scope.editProductRequirememts = function (){

      $state.go('productRequirements', {
        'productName': $scope.product.name
      });

    }

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

        Products.update($scope.product).success(function (product) {

          TestRuns.updateAllTestRunsForProduct($state.params.productName, product.name).success(function(testruns){

            TestRuns.list = testruns;

            Events.updateAllEventsForProduct($state.params.productName, product.name).success(function(events){

              Events.list = events;

                  /* Refresh sidebar */
              Products.fetch().success(function (products) {
                $scope.products = Products.items;
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
