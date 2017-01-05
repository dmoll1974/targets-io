'use strict';

angular.module('products').directive('productDashboards', ProductDashboardsDirective);

function ProductDashboardsDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/products/directives/product-dashboards/product-dashboards.client.view.html',
    controller: ProductDashboardsDirectiveController
  };

  return directive;

  /* @ngInject */
  function ProductDashboardsDirectiveController ($scope, $state, $stateParams, $window, Templates, Dashboards, $filter, $rootScope, $interval, Products, ConfirmModal, $modal) {


    $scope.updateDashboard = updateDashboard;
    $scope.viewDashboard = viewDashboard;
    $scope.editDashboard = editDashboard;
    $scope.viewTrends = viewTrends;
    $scope.toggleJenkinsIntegration = toggleJenkinsIntegration;
    $scope.openMenu = openMenu;
    $scope.addTestRun = addTestRun;
    $scope.manageTags = manageTags;
    $scope.addTemplate = addTemplate;
    $scope.clone = clone;
    $scope.openDeleteDashboardModal = openDeleteDashboardModal;



    /* activate */

    activate();



    /* functions */


    function activate() {



    }


    function viewDashboard(dashboard) {


        $state.go('viewDashboard', {
          'productName': $scope.product.name,
          'dashboardName': dashboard.name
        });


    };

    function editDashboard(dashboard) {

        Dashboards.selected = dashboard;

        $state.go('editDashboard', {
          'productName': $scope.product.name,
          'dashboardName': dashboard.name
        });


    };

    function updateDashboard(dashboard) {


        Dashboards.update(dashboard).success(function(dashboard){

          var dashboardIndex = $scope.product.dashboards.map(function(productDashboard){
            return productDashboard.name;
          }).indexOf(dashboard.name);

          $scope.product.dashboards[dashboardIndex] = dashboard;
        })


    };

    function toggleJenkinsIntegration(dashboard) {

      if(dashboard.jenkinsJobName) {

        Dashboards.update(dashboard).success(function (dashboard) {

          var dashboardIndex = $scope.product.dashboards.map(function (productDashboard) {
            return productDashboard.name;
          }).indexOf(dashboard.name);

          $scope.product.dashboards[dashboardIndex] = dashboard;
        })

      }else{

        Dashboards.selected = dashboard;

        $state.go('editDashboard', {
          'productName': $scope.product.name,
          'dashboardName': dashboard.name
        });



      }

    };

    function viewTrends(dashboard) {


        $state.go('viewTrends', {
          'productName': $scope.product.name,
          'dashboardName': dashboard.name,
          'tag': 'All'
        });


    };

    var originatorEv;
    function openMenu  ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    function addTestRun (dashboard){

      $state.go('addTestRun',{productName: $scope.product.name, dashboardName: dashboard.name});

    }

    function manageTags(dashboard){

      $state.go('manageDashboardTags',{productName: $scope.product.name, dashboardName: dashboard.name});

    }


    function addTemplate(dashboard){

      Dashboards.get($scope.product.name, dashboard.name).success(function(dashboard){

        Templates.selected = dashboard;
        $state.go('addTemplate');


      });

    }

    function clone (dashboard) {

      Dashboards.selected = dashboard;
      Dashboards.clone().success(function (dashboard) {

        $state.go('editDashboard', {
          'productName': $scope.product.name,
          'dashboardName': dashboard.name
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    function openDeleteDashboardModal (size, dashboard) {

      Dashboards.selected = dashboard;
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
          Products.get($scope.product.name).success(function (product) {
            $scope.product = product;

          });

        });
      }, function () {
      });
    };



  }
}
