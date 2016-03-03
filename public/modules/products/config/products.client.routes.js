'use strict';
//Setting up route
angular.module('products').config([
  '$stateProvider',
  function ($stateProvider) {
    // Products state routing
    $stateProvider.state('listProducts', {
      url: '/products',
      templateUrl: 'modules/products/views/list-products.client.view.html'
    }).state('createProduct', {
      url: '/add/product',
      templateUrl: 'modules/products/views/create-product.client.view.html'
    }).state('viewProduct', {
      url: '/browse/:productName/',
      templateUrl: 'modules/products/views/view-product.client.view.html'
    }).state('editProduct', {
      url: '/edit/product/:productName/',
      templateUrl: 'modules/products/views/edit-product.client.view.html'
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
