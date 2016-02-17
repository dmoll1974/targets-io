'use strict';
//Products service used to communicate Products REST endpoints
angular.module('products').factory('Products', [
  '$resource',
  '$http',
  'SideMenu',
  function ($resource, $http, SideMenu) {
    var Products = {
      items: [],
      'get': getFn,
      query: query,
      fetch: fetch,
      create: create,
      delete: deleteFn,
      update: update,
      selected: {},
      selectedRequirement: {},
      /* product release services*/
      addProductRelease: addProductRelease,
      updateProductRelease: updateProductRelease,
      deleteProductRelease: deleteProductRelease,
      getProductRelease: getProductRelease
    };
    return Products;
    function create(product) {
      return $http.post('/products', product);
    }
    function update(product) {
      return $http.put('/product-by-id/' + product._id, product);
    }
    function deleteFn(productId) {
      return $http.delete('/product-by-id/' + productId);
    }
    function fetch() {
      return $http.get('/products').success(function (products) {
      });
    }
    function getFn(productName) {
      return $http.get('/products/' + productName);
    }
    function query(a1, a2, a3, a4) {
      var resource = $resource('products/:productId', { productName: '@_id' }, { update: { method: 'PUT' } });
      return resource.query(a1, a2, a3, a4);
    }
    function addProductRelease(productRelease){

      return $http.post('/product-release', productRelease);

    }

    function updateProductRelease(productRelease){

      return $http.put('/product-release', productRelease);

    }

    function deleteProductRelease(productRelease){

      return $http.delete('/product-release/' + productRelease.name + '/' + productRelease.productRelease);

    }

    function getProductRelease(productName, productRelease){

      return $http.get('/product-release/' + productName + '/' + productRelease);

    }
  }
]);
