'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Release = mongoose.model('Release'),
    _ = require('lodash');


exports.create = create;
exports.update = update;
exports.delete = deleteRelease;
exports.get = getRelease;

/**
 * Delete a Template
 */
function deleteRelease(req, res) {

    Release.remove({
        $and: [
            {productName: req.params.product},
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

function update(req, res){


    Release.findOne({$and:[
        {name: req.body.name},
        {productRelease: req.body.productRelease}

    ]}).exec(function(err, release){

        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else{

            release.requirements = req.body.requirements;

            release.save(function(err, savedRelease){

                if (err) {
                    return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                } else {

                    res.jsonp(savedRelease);

                }
            });
        }

    })


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


