'use strict';

/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('dup key')-2);
		switch(fieldName){

			case 'name_1':
				output = 'Product name already exists!'
				break;
			case 'name_1_productId_1':
				output = 'Dashboard name already exists for this product!'
				break;
			case 'productName_1_dashboardName_1_testRunId_1_eventDescription_1':
				output = 'Combination of testrun ID and description already exists for this dashboard!'
				break;
			default:
				output = 'Unique field already exists';
		}
		//output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};
