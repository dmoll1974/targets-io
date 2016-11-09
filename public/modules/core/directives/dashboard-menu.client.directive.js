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
    function DashboardMenuDirectiveController ($scope, $state, $stateParams, $timeout, Products, Dashboards, Templates, ConfirmModal, $modal) {



        $scope.openMenu = openMenu;
        $scope.addTestRun = addTestRun;
        $scope.manageTags = manageTags;
        $scope.addDashboard = addDashboard;
        $scope.addTemplate = addTemplate;
        $scope.clone = clone;
        $scope.edit = edit;
        $scope.openDeleteDashboardModal = openDeleteDashboardModal;




        var originatorEv;
        function openMenu  ($mdOpenMenu, ev) {
            originatorEv = ev;
            $mdOpenMenu(ev);
        };

        function addTestRun (){

            $state.go('addTestRun',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName});

        }

        function manageTags(){

            $state.go('manageDashboardTags',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName});

        }

        function addDashboard(){

            $state.go('addDashboard', {productName: $scope.product.name});
        }

        function addTemplate(){

            Templates.selected = Dashboards.selected;
            $state.go('addTemplate');

        }

        function clone () {
            Dashboards.clone().success(function (dashboard) {

                $state.go('editDashboard', {
                    'productName': $stateParams.productName,
                    'dashboardName': dashboard.name
                });
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        function edit() {
            $state.go('editDashboard', {
                'productName': $stateParams.productName,
                'dashboardName': $stateParams.dashboardName
            });
        };

        function openDeleteDashboardModal (size) {
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
                        $state.go('viewProduct', { 'productName': $stateParams.productName });
                    });

                });
            }, function () {
            });
        };

    }
}
