'use strict';
/**
 * Module dependencies.
 */
var os = require('os');
var winston = require('winston');

var host = os.hostname()

exports.healthCheck = healthCheck;

function healthCheck(req, res){

  //winston.info('Node ' + os.hostname() + ' is alive!');
  res .set('Content-type', 'text/plain')
      .status(200)
      .send('Node '+ host + ' is alive!');
}
