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


        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else{

            var response = {};

            if(release){

                /* check number of requirements to detect changes later*/

                var numberOfRequirementsInStoredRelease = countRequirements(release);

                var updatedRelease = new Release(release);


                /* Get release testruns */
                synchronizeTestRunsForProductRelease(updatedRelease)
                .then(setRequirements)
                .then(function(updatedReleaseForResponse){

                    response.productRelease = updatedReleaseForResponse;


                    /* since isEqual doesn't detect changes in requirements,  compare number of requirements */

                    response.hasBeenUpdated = numberOfRequirementsInStoredRelease === countRequirements(updatedReleaseForResponse) ? false : true;

                    /* if number of requirements are the same check release test runs*/
                    if (response.hasBeenUpdated === false ){

                        response.hasBeenUpdated = _.isEqual(release.toObject(), updatedReleaseForResponse.toObject()) ? false : true;

                    }


                    res.jsonp(response);

                })

            }else{

                response.productRelease = release;
                response.hasBeenUpdated = false;
                res.jsonp(response);
            }


        }

    })


};

function countRequirements(release){

    var count = 0;

    _.each(release.releaseTestRuns, function(releaseTestrun){

        count += releaseTestrun.requirements.length;
    })

    return count;

}

function setRequirements(release){

    return new Promise((resolve, reject) => {

        Product.findOne({name: release.name}).exec(function(err, product){

            if (err) {
                reject(err);
            } else {

                if(product) {

                    _.each(release.releaseTestRuns, function(releaseTestRun){

                        /* get all requirements related to dashboard*/
                        var dashboardRequirements = product.requirements.filter(function (requirement) {
                            if (requirement.relatedDashboards.indexOf(releaseTestRun.dashboardName) !== -1) {
                                return requirement;
                            }
                        })

                        var updatedRequirements = [];

                        _.each(dashboardRequirements, function (dashboardRequirement) {

                            var index = releaseTestRun.requirements.map(function (releaseTestRunRequirement) {
                                return releaseTestRunRequirement.description;
                            }).indexOf(dashboardRequirement.description);

                            if (index === -1){

                                updatedRequirements.push({
                                    stakeholder: dashboardRequirement.stakeholder,
                                    description: dashboardRequirement.description,
                                    result: false
                                });
                            } else {

                                updatedRequirements.push({
                                    stakeholder: releaseTestRun.requirements[index].stakeholder,
                                    description: releaseTestRun.requirements[index].description,
                                    result: releaseTestRun.requirements[index].result
                                });

                            }
                        });

                        releaseTestRun.requirements = updatedRequirements;
                    });

                    resolve(release);

                }else{

                    resolve(release);

                }
            }
        });
    });
}

function synchronizeTestRunsForProductRelease(storedRelease){

    return new Promise((resolve, reject) => {

        var synchronizedReleaseTestRuns = [];

        synchronizedReleaseTestRuns = storedRelease.releaseTestRuns;

        testRunModule.testRunsForProductReleaseImpl(storedRelease.name, storedRelease.productRelease)
        .then(function(currentTestRuns){


            if(currentTestRuns.length > 0) {

                _.each(currentTestRuns, function (currentTestRun) {

                    var index = storedRelease.releaseTestRuns.map(function (storedReleaseTestRun) {
                        return storedReleaseTestRun.testRunId;
                    }).indexOf(currentTestRun.testRunId);

                    if (index === -1) {
                    //
                    //    synchronizedReleaseTestRuns.push(storedRelease.releaseTestRuns[index]);
                    //
                    //} else {

                        synchronizedReleaseTestRuns.push(currentTestRun);

                    }


                })
            }

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


