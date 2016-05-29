'use strict';
/**
 * Module dependencies.
 */
var redis = require('redis'),
    config = require('../../config/config'),
    md5 = require('MD5');

exports.createKey = createKey;
exports.setCache = setCache;
exports.getCache = getCache;


var client = redis.createClient(config.redisPort, config.redisHost, {no_ready_check: true});


client.on('connect', function() {
  console.log('Redis host' + config.redisHost + ':' + config.redisPort );
});

function setCache(key, object, expiry, callback){

  client.hmset(key, object, function(err, result){

    if(err){

      console.log(err)
    }else{

      client.expire(key, expiry);
      callback();
    }


  });

}

function getCache(key, callback){

  client.hmget(key, function(err, object){

    if(err){
      console.log(err);
    }else{

      callback(object);
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
