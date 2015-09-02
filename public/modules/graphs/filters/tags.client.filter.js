'use strict';

angular.module('graphs').filter('tagsFilter', [
	function() {

            function parseString(input) {
                return input.split(".");
            }

            function getValue(element, propertyArray) {
                var value = element;

                _.forEach(propertyArray, function (property) {
                    value = value[property];
                });

                return value;
            }

        return function (array, propertyString, inputTarget) {
            var properties = parseString(propertyString);
            var filterOperator;

            if (inputTarget.indexOf(" AND ") > -1) {

                filterOperator = " AND ";

            } else if (inputTarget.indexOf(" OR ") > -1) {

                filterOperator = " OR ";
            }

            var target = inputTarget.split(filterOperator);


            /* if single target*/
            if (target.length == 1) {
                /* if target is 'All', filter none */
                if (target[0] === 'All') {
                    return array;
                } else {
                    return _.filter(array, function (item) {

                        var matchResult = false;

                        _.each(getValue(item, properties), function (arrayItem) {

                            if (target[0] === arrayItem.text) matchResult = true;

                        })
                        return matchResult;
                    });
                }
            } else {

                if (filterOperator === " AND ") {

                    return _.filter(array, function (item) {

                        var matchResults = [];

                        _.each(target, function (matchtarget) {

                            var targetMatchResult = false;

                            _.each(getValue(item, properties), function (arrayItem) {

                                if (matchtarget === arrayItem.text)targetMatchResult = true;


                            })

                            matchResults.push(targetMatchResult);

                        })


                        return matchResults.indexOf(false) > -1 ? false : true;
                    });

                    /* filterOperator = OR*/
                } else {

                    return _.filter(array, function (item) {

                        var targetMatchResult = false;

                        _.each(target, function (matchtarget) {

                            _.each(getValue(item, properties), function (arrayItem) {

                                if (matchtarget === arrayItem.text)targetMatchResult = true;

                            })

                        })


                        return targetMatchResult;
                    });

                }
            }
        }
    }

]);
