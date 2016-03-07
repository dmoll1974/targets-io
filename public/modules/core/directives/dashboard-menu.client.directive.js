'use strict';

angular.module('core').directive('dashboardMenu', DashboardMenuDirective);

function DashboardMenuDirective () {

    var directive = {

        restrict: 'EA',
        templateUrl: 'modules/core/directives/dashboard-menu.client.view.html',
        controller: DashboardMenuDirectiveController
    };

    return directive;

    /* @ngInject */
    function DashboardMenuDirectiveController ($scope, $state, $stateParams, $interval, Products, Dashboards, Templates, ConfirmModal, $modal) {

        var originatorEv;
        $scope.openMenu = function ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        $scope.addTestRun = function (){

            $state.go('addTestRun',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName});

        }

        $scope.manageTags = function(){

            $state.go('manageDashboardTags',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName});

        }

        $scope.addDashboard = function(){

            $state.go('addDashboard', {productName: $stateParams.productName});
        }

        $scope.addTemplate = function(){

            Templates.selected = Dashboards.selected;
            $state.go('addTemplate');

        }

        $scope.clone = function () {
            Dashboards.clone().success(function (dashboard) {
                /* Refresh header */
                Products.fetch().success(function (products) {
                    Products.items = products;
                    $scope.products = products;
                });
                $state.go('editDashboard', {
                    'productName': $stateParams.productName,
                    'dashboardName': dashboard.name
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
                        Products.items = products;
                        $scope.products = products;
                    });
                    $state.go('viewProduct', { 'productName': $stateParams.productName });
                });
            }, function () {
            });
        };

    }
}
