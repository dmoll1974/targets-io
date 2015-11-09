'use strict';
// Dashboards controller
angular.module('dashboards').controller('DashboardsController', [
  '$scope',
  '$rootScope',
  '$modal',
  '$log',
  '$stateParams',
  '$state',
  '$location',
  'ConfirmModal',
  'Dashboards',
  'Products',
  'Metrics',
  'TestRuns',
  'SideMenu',
  '$q',
  function ($scope, $rootScope, $modal, $log, $stateParams, $state, $location, ConfirmModal, Dashboards, Products, Metrics, TestRuns, SideMenu, $q) {
    var originatorEv;
    $scope.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.$watch('allMetricsSelected', function (newVal, oldVal) {
        if (newVal !== oldVal) {
          _.each($scope.dashboard.metrics, function (metric, i) {
            metric.selected = newVal;
          });
        }
    });

    $scope.setMetricsSelected = function(metricSelected){

        if (metricSelected === false){

          $scope.metricSelected = false;

          _.each($scope.dashboard.metrics, function(metric){
              if(metric.selected === true) $scope.metricSelected = true;
          })

        }else {
          $scope.metricSelected = metricSelected;
        }
    };

    $scope.setAllMetricsSelected = function(metricSelected){

      $scope.metricSelected = metricSelected;
    };


    // Edit Product
    $scope.editProduct = function (productName) {
      $state.go('editProduct', { productName: productName });
    };
    $scope.useInBenchmarkOptions = [
      'no',
      'yes'
    ];
    /* Tab controller */
    $scope.$watch(function (scope) {
      return Dashboards.selectedTab;
    }, function () {
      $scope.selectedIndex = Dashboards.selectedTab;
    });
    $scope.setTab = function (newValue) {
      Dashboards.selectedTab = newValue;
    };
    /* Watch on dashboard */
    $scope.$watch(function (scope) {
      return Dashboards.selected;
    }, function () {
      $scope.dashboard = Dashboards.selected;
      SideMenu.productFilter = $stateParams.productName;
    });
    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;
    //$scope.authentication = Authentication;
    $scope.addMetric = function () {
      //            console.log('add/metric/' + $stateParams.productName + '/' + $stateParams.dashboardName)
      $state.go('createMetric', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    };
    // Create new Dashboard
    $scope.create = function () {
      // Create new Dashboard object
      //var dashboard = {};
      //dashboard.name = this.name;
      //dashboard.description = this.description;
      //dashboard.useInBenchmark = this.useInBenchmark;
      Dashboards.create($scope.dashboard, $stateParams.productName).then(function (response) {
        /* Refresh sidebar */
        Products.fetch().success(function (products) {
          $scope.products = Products.items;
          SideMenu.addProducts(products);
          $state.go('viewDashboard', {
            productName: $stateParams.productName,
            dashboardName: response.data.name
          });
          $scope.productForm.$setPristine();  //
                                              //// Clear form fields
                                              //$scope.name = '';
                                              //$scope.description = '';
                                              //$scope.productName = '';
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.edit = function () {
      $state.go('editDashboard', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    };
    $scope.manageTags = function () {
      $state.go('manageTags', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    };
    $scope.clone = function () {
      Dashboards.clone().success(function (dashboard) {
        /* Refresh sidebar */
        Products.fetch().success(function (products) {
          SideMenu.addProducts(products);
          $scope.products = Products.items;
        });
        $state.go('editDashboard', {
          'productName': $stateParams.productName,
          'dashboardName': dashboard.name
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.viewLiveGraphs = function () {
      $state.go('viewLiveGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
      });
    };
    // Remove existing Dashboard
    $scope.remove = function (dashboard) {
      if (dashboard) {
        dashboard.$remove();
        for (var i in $scope.dashboards) {
          if ($scope.dashboards[i] === dashboard) {
            $scope.dashboards.splice(i, 1);
          }
        }
      } else {
        $scope.dashboard.$remove(function () {
          $location.path('dashboards');
        });
      }
    };
    // Update existing Dashboard
    $scope.update = function () {
      Dashboards.update($scope.dashboard).then(function (dashboard) {
        /* Refresh sidebar */
        Products.fetch().success(function (products) {
          SideMenu.addProducts(products);
          $scope.products = Products.items;
        });
        $state.go('viewDashboard', {
          'productName': $stateParams.productName,
          'dashboardName': $scope.dashboard.name
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.init = function () {
      /* reset form*/
      //$scope.dashboardForm.$setPristine();
      $scope.dashboard = {};
      Dashboards.selected = {};
    };
    $scope.cancel = function () {
      /* reset form*/
      $scope.dashboardForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };
    // Find existing Dashboard
    $scope.findOne = function () {
      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
        $scope.dashboard = Dashboards.selected;
        $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
        Products.get($stateParams.productName).success(function (product) {
          Products.selected = product;
          TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, Dashboards.selected.useInBenchmark).success(function (testRuns) {
            $scope.testRuns = testRuns;
          });
        });
      });
    };
    $scope.openDeleteMetricModal = function (size, index) {
      Metrics.selected = $scope.dashboard.metrics[index];
      ConfirmModal.itemType = 'Delete metric ';
      ConfirmModal.selectedItemId = Metrics.selected._id;
      ConfirmModal.selectedItemDescription = Metrics.selected.alias;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        Metrics.delete(Metrics.selected._id).success(function (metric) {
          /* refresh dashboard*/
          Dashboards.get($scope.productName, $scope.dashboardName).success(function (dashboard) {
            $scope.dashboard = Dashboards.selected;
          });
        });
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
    $scope.openDeleteSelectedMetricsModal = function (size) {

      ConfirmModal.itemType = 'Delete ';
      ConfirmModal.selectedItemId = '';
      ConfirmModal.selectedItemDescription = 'selected metrics';
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        var deleteMetricArrayOfPromises = [];

        _.each($scope.dashboard.metrics, function(metric, index){

          if(metric.selected === true)
            deleteMetricArrayOfPromises.push(Metrics.delete(metric._id));

        });


        $q.all(deleteMetricArrayOfPromises)
          .then(Dashboards.get($scope.productName, $scope.dashboardName))
          .then(function (dashboard) {
                  $scope.dashboard = Dashboards.selected;
          });

      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });

    };
    $scope.openDeleteDashboardModal = function (size) {
      ConfirmModal.itemType = 'Delete dashboard ';
      ConfirmModal.selectedItemId = Dashboards.selected._id;
      ConfirmModal.selectedItemDescription = Dashboards.selected.name;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        Dashboards.delete(Dashboards.selected._id).success(function (dashboard) {
          /* Refresh sidebar */
          Products.fetch().success(function (products) {
            SideMenu.addProducts(products);
            $scope.products = Products.items;
          });
          $state.go('viewProduct', { 'productName': $stateParams.productName });
        });
      }, function () {
      });
    };
  }
]);
