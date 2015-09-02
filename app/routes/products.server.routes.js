'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var products = require('../../app/controllers/products.server.controller');

	// Products Routes
	app.route('/products')
		.get(products.list)
		.post( products.create);//users.requiresLogin,

	app.route('/products/:productName')
        .get(products.read);


    app.route('/product-by-id/:productId')
        .delete(products.delete) //users.requiresLogin, products.hasAuthorization,
        .put(products.update); //users.requiresLogin, products.hasAuthorization,

    // Finish by binding the Product middleware
	app.param('productName', products.productByName);
    app.param('productId', products.productById);
};
