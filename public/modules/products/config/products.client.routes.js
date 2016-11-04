'use strict';
//Setting up route
angular.module('products').config([
  '$stateProvider',
  function ($stateProvider) {
    // Products state routing
    $stateProvider.state('listProducts', {
      url: '/products',
      templateUrl: 'modules/products/views/list-products.client.view.html'
    }).state('addProduct', {
      url: '/add/product',
      template: '<add-product></add-product>'
    }).state('viewProduct', {
      url: '/browse/:productName/',
      template: '<view-product></view-product>'
    }).state('editProduct', {
      url: '/edit/product/:productName/',
      template: '<edit-product></edit-product>'
    }).state('productRequirements', {
      url: '/product-requirements/:productName/',
      template: '<product-requirements></product-requirements>'
    }).state('addProductRequirement', {
      url: '/add-product-requirement/:productName/',
      template: '<add-product-requirement></add-product-requirement>'
    }).state('editProductRequirement', {
      url: '/edit-product-requirement/:productName/',
      template: '<edit-product-requirement></edit-product-requirement>'
    }).state('productReleaseDetails', {
      url: '/product-release-details/:productName/:productRelease/',
      template: '<product-release-details></product-release-details>'
    }).state('addProductReleaseLink', {
      url: '/add-link/:productName/:productRelease/',
      template: '<add-product-release-link></add-product-release-link>'
    });
  }
]);
