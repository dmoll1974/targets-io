'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    winston = require('winston'),
    errorHandler = require('./errors.server.controller'),
    request = require('request'),
    requestjson = require('request-json'),
    cache = require('./redis.server.controller'),
    config = require('../../config/config'),
    Dashboard = mongoose.model('Dashboard'),
    Testrun = mongoose.model('Testrun'),

    Product = mongoose.model('Product');

exports.getGraphiteData = getGraphiteData;
exports.findMetrics = findMetrics;
exports.getData = getData;
exports.flushCache = flushCache;

    /**
 * Find metrics
 */

function findMetrics(req, res) {


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
function getData(req, res) {
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


  /* construct graphite url*/
  var graphiteTargetUrl = createUrl(from, until, targets, maxDataPoints);

  /* create cache key*/
  var cacheKey = cache.createKey(graphiteTargetUrl);


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
    //winston.info('get key: ' + cacheKey + 'graphiteTargetUrl: ' + graphiteTargetUrl);

    cache.getCache(cacheKey, function (result) {

      if (result !== null) {
        console.dir('cache hit: ' + cacheKey);
        callback(eval(result));
      } else {
        //winston.info(graphiteTargetUrl);
        /* if no cache hit, go to graphite back end */
        client.get(graphiteTargetUrl, function (err, response, body) {
          if (err) {
            callback([]);
          } else {
            callback(body);
            /* add to redis if it is a valid response */
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

  /* convert epoch timestamps in ms to s*/
  if(until === 'now'){

    var fromInSeconds = from.match(/[a-z]/i) ? from : Math.round(from / 1000);
    var untilInSeconds = until.match(/[a-z]/i) ? until : Math.round(until / 1000);

  }else{

    var fromInSeconds = Math.round(from / 1000);
    var untilInSeconds = Math.round(until / 1000);

  }



  var graphiteTargetUrl = '/render?format=json&from=' + fromInSeconds + '&until=' + untilInSeconds + '&maxDataPoints=' + maxDataPoints;
  if (_.isArray(targets)) {
    _.each(targets, function (target) {
      graphiteTargetUrl += '&target=' + target;
    });
  } else {
    graphiteTargetUrl += '&target=' + targets;
  }
  return graphiteTargetUrl;
}


function flushCache(req, res) {
  /* gettestRun */
  var testRun = req.body;

  flushGraphiteCacheForTestRun(testRun, false, function (message) {
    res.jsonp(message);
  });
};

exports.flushGraphiteCacheForTestRun = flushGraphiteCacheForTestRun;

function flushGraphiteCacheForTestRun(testRunParam, isBenchmark, callback){

  Testrun.findOne({
    $and: [
      { productName: testRunParam.productName },
      { dashboardName: testRunParam.dashboardName },
      { testRunId: testRunParam.testRunId }
    ]
  }).exec(function (err, testRun) {

    Product.findOne({ name: testRun.productName}).exec(function(err, product){

      if(err){
        callback(err);
      }else{

        Dashboard.findOne({$and:[{name: testRun.dashboardName}, {productId: product._id}]})
            .populate({path: 'metrics', options: { sort: { tag: 1, alias: 1 } } })
            .exec(function (err, dashboard) {
              if (err) return console.error(err);

              _.each(dashboard.metrics, function(metric){


                if(isBenchmark) {
                  _.each(metric.targets, function (target) {


                    /* if include ramp up is false, add ramp up period to start of test run */
                    var start = (testRun.rampUpPeriod && dashboard.includeRampUp === false ) ? new Date(testRun.start.getTime() + testRun.rampUpPeriod * 1000) : testRun.start;
                    /* construct graphite url*/
                    var graphiteTargetUrl = createUrl(start, testRun.end, target, 900);

                    /* create cache key*/
                    var cacheKey = cache.createKey(graphiteTargetUrl);

                    winston.info('flush key: ' + cacheKey + 'graphiteTargetUrl: ' + graphiteTargetUrl);

                    cache.flushCache(cacheKey, function (message) {

                      winston.info(message);


                    });

                  });
                }else{

                  /* construct graphite url*/
                  var graphiteTargetUrl = createUrl(testRun.start, testRun.end, metric.targets, 900);

                  /* create cache key*/
                  var cacheKey = cache.createKey(graphiteTargetUrl);

                  winston.info('flush key: ' + cacheKey + 'graphiteTargetUrl: ' + graphiteTargetUrl);

                  cache.flushCache(cacheKey, function (message) {

                    winston.info(message);


                  });
                }
              });

              callback("Cache has been flushed for test run: " + testRun.testRunId);


            });

      }
    })
  })

}
