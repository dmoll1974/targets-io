'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Release = mongoose.model('Release'),
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
            res.jsonp(release);

        }

    })


};

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


