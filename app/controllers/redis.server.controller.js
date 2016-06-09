'use strict';
/**
 * Module dependencies.
 */
var redis = require('redis'),
    config = require('../../config/config'),
    _ = require('lodash'),
    md5 = require('MD5');

exports.createKey = createKey;
exports.setCache = setCache;
exports.getCache = getCache;
exports.flushCache = flushCache;



var client = redis.createClient(config.redisPort, config.redisHost, {no_ready_check: true});


client.on('connect', function() {
  console.log('Redis host' + config.redisHost + ':' + config.redisPort );
});

function setCache(key, array, expiry, callback){

  client.set(key, JSON.stringify(array));
  client.expire(key, expiry);
  callback();


}

function getCache(key, callback){

  client.get(key, function(err, object){

    if(err){
      console.log(err);
    }else{

      callback(object);
    }
  });
}

function flushCache(key, callback){

  client.del(key, function(err, reply){

    if(err){
      console.log(err);
    }else{

      callback();
    }
  });
}

function createKey(from, until, targets) {
  var key;
  var hashedKey;
  key = from.toString() + until.toString();
  if (_.isArray(targets)) {
    targets.sort();
    _.each(targets, function (target) {
      key += target;
    });
  } else {
    key += targets;
  }
  hashedKey = md5(key);
  return hashedKey;
}
