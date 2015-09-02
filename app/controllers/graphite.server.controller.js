'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    requestjson = require('request-json'),
    config = require('../../config/config'),
    Memcached = require('memcached'),
    md5 = require('MD5');


/* Memcached config */

Memcached.config.poolSize = 25;
Memcached.config.timeout = 1000;
Memcached.config.retries = 3;
Memcached.config.reconnect = 1000;
Memcached.config.maxValue = 10480000;
Memcached.config.poolSize = 50;

exports.getGraphiteData = getGraphiteData;
exports.flushMemcachedKey = flushMemcachedKey;
exports.createMemcachedKey = createMemcachedKey;


/**
 * Get  Graphite data
 */
exports.getData = function(req, res) {

    /* get url params */
    var from = req.query.from;
    var until = req.query.until;
    var targets = req.query.target;
    var maxDataPoints = req.query.maxDataPoints;



    getGraphiteData (from, until, targets, maxDataPoints, function(body){

        res.set('Content-Type', 'application/javascript');
        res.jsonp(body);
    });


}

function getGraphiteData(from, until, targets, maxDataPoints, callback){

    /* memcached stuff*/

    var memcachedKey = createMemcachedKey (from, until, targets);
    var memcached = new Memcached(config.memcachedHost);

    var graphiteTargetUrl = createUrl(from, until, targets, maxDataPoints);

    var client = requestjson.createClient(config.graphiteHost);

    /* Don't cache live data! */
    if(until === 'now'){


        client.get(graphiteTargetUrl, function (err, response, body) {
            if (err) {
                //return response.status(400).send({
                //    message: errorHandler.getErrorMessage(err)
                //});
            } else {

                callback(body);

            }
        });

    }else {

        /* first check memcached */
        memcached.get(memcachedKey, function (err, result) {
            if (err) console.error(err);

            if (result) {

                console.dir("cache hit: " + memcachedKey);

                callback(result);


                memcached.end();

            } else {

                //console.log(graphiteTargetUrl);
                /* if no cache hit, go to graphite back end */
                client.get(graphiteTargetUrl, function (err, response, body) {
                    if (err) {
                        callback(err);
                    } else {

                        callback(body);

                        /* add to memcached if it is a valid response */
                        if (body != '[]' && body.length > 0 && response.statusCode == 200) {

                            memcached.set(memcachedKey, body, 3600 * 24 * 7, function (err, result) {
                                if (err) console.error(err);
                                console.dir("key set " + memcachedKey + " : " + result);
                                memcached.end();
                            });
                        }
                    }
                });
            }
        });

    }

};

function createUrl(from, until, targets, maxDataPoints){

    var graphiteTargetUrl = '/render?format=json&from=' + from + "&until=" + until + "&maxDataPoints=" + maxDataPoints;

    if (_.isArray(targets)){
        _.each(targets, function(target){

            graphiteTargetUrl += '&target=' + target;

        });
    }else{

        graphiteTargetUrl += '&target=' + targets;
    }

    return graphiteTargetUrl;
}

function createMemcachedKey (from, until, targets){


    var memcachedKey;
    var hashedMemcachedKey;

    memcachedKey = from.toString() + until.toString();

    if (_.isArray(targets)) {

        targets.sort();
        _.each(targets, function (target) {

            memcachedKey += target;

        });
    }else{

        memcachedKey += targets;
    }
//    console.log("raw key:" + memcachedKey)
    hashedMemcachedKey = md5(memcachedKey)

    return hashedMemcachedKey;

//    return memcachedKey.replace(/\s/g,'');
}

function flushMemcachedKey(key, callback){

    var memcached = new Memcached(config.memcachedHost);

   memcached.del( key, function( err, result ){
        if( err ) callback( err );
        console.info( "deleted key: " + key + " : " + result );
        callback();
   });


    memcached.end(); // as we are 100% certain we are not going to use the connection again, we are going to end it

}
