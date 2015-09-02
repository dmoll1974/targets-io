'use strict';

//Products service used to communicate Products REST endpoints
angular.module('products').factory('Products', ['$resource', '$http',
	function($resource, $http) {

        
        var Products = {
            items : [],
            'get' : getFn,
            query : query,
            fetch : fetch,
            create: create,
            delete: deleteFn,
            update: update,
            selected: {}

        };
        
        return Products;


        function create(product){
            return $http.post('/products', product);
        }

        function update(product){
            return $http.put('/product-by-id/' + product._id, product);
        }

        function deleteFn(productId){
            return $http.delete('/product-by-id/' + productId);
        }

        function fetch(){
            return $http.get('/products').success(function(items){
                
                Products.items = items;
            });
        }
        
        function getFn(productName){
            return $http.get('/products/' + productName);
        }
        
        function query (a1, a2, a3, a4){
           var resource = $resource('products/:productId', { productName: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
            return resource.query(a1, a2, a3, a4);
        }
	}
]);
