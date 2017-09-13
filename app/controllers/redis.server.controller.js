'use strict';
/**
 * Module dependencies.
 */
var redis = require('redis'),
    winston = require('winston'),
    config = require('../../config/config'),
    _ = require('lodash'),
    md5 = require('MD5');


exports.createKey = createKey;
exports.setCache = setCache;
exports.getCache = getCache;
exports.flushCache = flushCache;

var redisReconnecting = true;

var client = redis.createClient(config.redisPort, config.redisHost,
      {
       retry_strategy: function retry(options) {
          console.log(options);
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }

          return Math.max(options.attempt * 100, 2000);
        }

      }
  );


client.on('error', function error(err) {
    winston.info('Redis error:' + err);
});

client.on('reconnecting', function reconnecting() {
    winston.info('Reconnecting to Redis');
    redisReconnecting = true;

});

client.on('connect', function connect() {
  winston.info('Connected to Redis');

});

client.on('ready', function connect() {
  winston.info('Redis is ready!');
  redisReconnecting = false;


});


function setCache(key, array, expiry, callback){

    if(redisReconnecting !== true) {

        client.set(key, JSON.stringify(array));
        client.expire(key, expiry);

    }

    callback();


}

function getCache(key, callback){

    if(redisReconnecting !== true) {

        client.get(key, function (err, object) {

            if (err) {
                winston.error('Cannot get key, error: ' + err);
                callback();

            } else {

                callback(object);
            }
        });
    }else{

        callback(null);
    }

}

function flushCache(key, callback){

    if(redisReconnecting !== true) {

        client.del(key);
        callback('flushed key: ' + key);
    }else{

        callback();
    }
}

function createKey(url) {
  var key;
  var hashedKey;
  //key = from.toString() + until.toString();
  //if (_.isArray(targets)) {
  //  targets.sort();
  //  _.each(targets, function (target) {
  //    key += target;
  //  });
  //} else {
  //  key += targets;
  //}
  hashedKey = md5(url);
  //return url;
  return hashedKey;
}
