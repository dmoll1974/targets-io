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
 * List Templates
 */

function list(req, res){

    Template.find().sort('name').exec(function(err, templates){

        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(templates);
        }
    });
};

/**
 * Update a Template
 */

function update(req, res){


    Release.findOne({$and:[
        {productName: req.body.productName},
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


/**
 * Template middleware
 */
function templateByID(req, res, next, id) {
    Template.findById(id).exec(function (err, template) {
        if (err)
            return next(err);
        if (!template)
            return next(new Error('Failed to load template ' + id));
        req.template = template;
        next();
    });
};

function templateByName(req, res, next, name) {
    Template.findOne({ name: name.toUpperCase()}).exec(function (err, template) {
        if (err)
            return next(err);
        if (!template)
            return res.status(404).send({ message: 'No template with name' + name + 'has been found' });
        req.template = template;
        next();
    });
};

