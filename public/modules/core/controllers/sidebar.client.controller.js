'use strict';

angular.module('core').controller('SidebarController', ['$scope', '$stateParams', '$state', '$location', 'Products', 'SideMenu',
    function($scope, $stateParams, $state, $location, Products, SideMenu) {


        function isOpen(section) {
            var regex = new RegExp('.*\/' + section.matcher + '(\/|$)');
            var open = regex.test($location.path());
            if(SideMenu.openedSection)
                return SideMenu.isSectionSelected(section);
            else
                return open;
        }

        function toggleOpen(section) {
            SideMenu.toggleSelectSection(section);
        }

        var vm = this;

        //functions for menu-link and menu-toggle
        vm.isOpen = isOpen;
        vm.toggleOpen = toggleOpen;
        vm.autoFocusContent = false;
        vm.menu = SideMenu;

        vm.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };




        $scope.clearProductFilter = function(){

          SideMenu.productFilter = '';
        };


        Products.fetch().success(function(products){
            SideMenu.addProducts(products);

        });
    
    
        $scope.$watch(function(scope) { return Products.items; },
            function() {
    
                $scope.products = Products.items;
                SideMenu.addProducts(Products.items);
            }
        );

        $scope.$watch(function(scope) { return SideMenu.productFilter; },
            function() {

                $scope.productFilter = SideMenu.productFilter;

            }
        );
    
    //    $scope.productIsActive = function(productName) {
    //        return $location.path().indexOf(productName)!== -1;
    //    };
    //
    //    $scope.dashboardIsActive = function(dashboardName) {
    //        if ($location.path().indexOf(dashboardName)!== -1) return 'dashboard-selected';
    //    };
    //
    //    $scope.viewProduct = function(index, productName){
    //
    //        Products.selected = $scope.products[index];
    //        $state.go('viewProduct', {productName: productName});
    //    }
    //
   }
]);
