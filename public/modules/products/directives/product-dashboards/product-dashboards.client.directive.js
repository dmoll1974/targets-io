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
  function ProductDashboardsDirectiveController ($scope, $state, $stateParams, $window, Templates, Dashboards, $filter, $rootScope, $interval, Products) {


    $scope.updateDashboard = updateDashboard;
    $scope.viewDashboard = viewDashboard;
    $scope.editDashboard = editDashboard;
    $scope.viewTrends = viewTrends;
    $scope.toggleJenkinsIntegration = toggleJenkinsIntegration;


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



  }
}
