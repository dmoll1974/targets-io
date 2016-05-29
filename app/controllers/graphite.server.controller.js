'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    request = require('request'),
    requestjson = require('request-json'),
    cache = require('./redis.server.controller')
    config = require('../../config/config');

exports.getGraphiteData = getGraphiteData;
exports.flushMemcachedKey = flushMemcachedKey;
exports.createMemcachedKey = createMemcachedKey;

/**
 * Find metrics
 */

exports.findMetrics = function (req, res) {


  // Set the headers
  var headers = {
    'Content-Type':     'application/json'
  }

// Configure the request
  var options = {
    url: config.graphiteHost + '/metrics/find',
    method: 'POST',
    headers: headers,
    form: { query: req.params.query }
  }

  request(options,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.json(JSON.parse(body));
        }
      }
  );


}
/**
 * Get  Graphite data
 */
exports.getData = function (req, res) {
  /* get url params */
  var from = req.query.from;
  var until = req.query.until;
  var targets = req.query.target;
  var maxDataPoints = req.query.maxDataPoints;
  getGraphiteData(from, until, targets, maxDataPoints, function (body) {
    res.set('Content-Type', 'application/javascript');
    res.jsonp(body);
  });
};

function getGraphiteData(from, until, targets, maxDataPoints, callback) {

  /* create cache key*/
  var cacheKey = cache.createKey(from, until, targets);

  /* construct graphite url*/
  var graphiteTargetUrl = createUrl(from, until, targets, maxDataPoints);

  var client = requestjson.createClient(config.graphiteHost);
  /* Don't cache live data! */
  if (until === 'now') {
    client.get(graphiteTargetUrl, function (err, response, body) {
      if (err) {
        //                return response.status(400).send({
        //                    message: errorHandler.getErrorMessage(err)
        //                });
        callback([]);
      } else {
        callback(body);
      }
    });
  } else {
    /* first check cache */
    cache.getCache(cacheKey, function (err, result) {
      if (err)
        console.error('cache error: ' + err);
      if (result && !err) {
        console.dir('cache hit: ' + cacheKey);
        callback(result);
      } else {
        //console.log(graphiteTargetUrl);
        /* if no cache hit, go to graphite back end */
        client.get(graphiteTargetUrl, function (err, response, body) {
          if (err) {
            callback([]);
          } else {
            callback(body);
            /* add to memcached if it is a valid response */
            if (body != '[]' && body.length > 0 && response.statusCode == 200) {
              cache.setCache(cacheKey, body, 3600 * 24 * 7, function (err, result) {
                if (err)
                  console.error(err);
                else
                  console.dir('key set ' + cacheKey );

              });
            }
          }
        });
      }
    });
  }
}
function createUrl(from, until, targets, maxDataPoints) {
  var graphiteTargetUrl = '/render?format=json&from=' + from + '&until=' + until + '&maxDataPoints=' + maxDataPoints;
  if (_.isArray(targets)) {
    _.each(targets, function (target) {
      graphiteTargetUrl += '&target=' + target;
    });
  } else {
    graphiteTargetUrl += '&target=' + targets;
  }
  return graphiteTargetUrl;
}
function flushMemcachedKey(key, callback) {
  var memcached = new Memcached(config.memcachedHost);
  memcached.del(key, function (err, result) {
    if (err)
      callback(err);
    console.info('deleted key: ' + key + ' : ' + result);
    callback();
  });
  memcached.end();  // as we are 100% certain we are not going to use the connection again, we are going to end it
}
