'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Release = mongoose.model('Release'),
    Product = mongoose.model('Product'),
    testRunModule = require('./testruns.server.controller'),
    _ = require('lodash');


exports.create = create;
exports.upsert = upsert;
exports.delete = deleteRelease;
exports.get = getRelease;

/**
 * Delete a Template
 */
function deleteRelease(req, res) {

    Release.remove({
        $and: [
            {name: req.params.product},
            {productRelease: req.params.productRelease}
        ]
    }).exec(function (err, release) {

        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {


           res.jsonp(release);

        }
    })

};

/**
 * Get Template by name
 */

function getTemplateByName(req, res) {

    res.jsonp(req.template);

};



/**
 * Update a Release
 */

function upsert(req, res){

    Release.findOneAndUpdate({
        $and:[
            {name: req.body.name},
            {productRelease: req.body.productRelease}
        ]
    }, {releaseLinks: req.body.releaseLinks, releaseTestRuns: req.body.releaseTestRuns, markDown: req.body.markDown}, {upsert: true}, function (err, release) {
                if (err) {
                    return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                } else {

                    res.jsonp(release);

                }
    });

};

function getRelease(req, res){


    Release.findOne({$and:[
        {name: req.params.product},
        {productRelease: req.params.productRelease}

    ]}).exec(function(err, release){

        var response = {};

        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else{

            if(release){

                /* Get release testruns */
                synchronizeTestRunsForProductRelease(release)
                .then(function(updatedRelease){

                    response.release = updatedRelease;
                    response.hasBeenUpdated = _.isEqual(release, updatedRelease) ? false : true;
                    res.jsonp(response);

                })

            }else{

                response.release = release;
                response.hasBeenUpdated = false;
                res.jsonp(response);
            }


        }

    })


};

function synchronizeTestRunsForProductRelease(storedRelease){

    return new Promise((resolve, reject) => {

        var synchronizedReleaseTestRuns = [];

        testRunModule.testRunsForProductReleaseImpl(release.productName, release.productRelease)
        .then(function(currentTestRuns){


                _.each(currentTestRuns, function(currentTestRun){

                    var index = storedRelease.releaseTestRuns.map(function(storedReleaseTestRun){return storedReleaseTestRun._id.toString(); }).indexOf(currentTestRun._id.toString());

                    if(index !== -1) {

                        synchronizedReleaseTestRuns.push(storedRelease.releaseTestRuns[index]);

                    }else {

                        synchronizedReleaseTestRuns.push(currentTestRun);

                    }


                })

                storedRelease.releaseTestRuns = synchronizedReleaseTestRuns;
                resolve(storedRelease);


        });

    });

}

function create(req, res){


    var release = new Release(req.body);


    release.save(function (err, savedRelease) {
        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(savedRelease);
        }
    });

}


