'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    requestjson = require('request-json'),
    config = require('../../config/config'),
    Memcached = require('memcached'),
    GatlingDetails = mongoose.model('GatlingDetails');

exports.getConsoleData = function (req, res) {
  var memcached = new Memcached(config.memcachedHost);
  var jenkinsKey = req.body.consoleUrl + req.body.running;
  memcached.get(jenkinsKey, function (err, result) {
    if (err)
      console.error(err);
    if (result) {
      console.dir('cache hit jenkins: ' + result);
      res.jsonp(result);
    } else {

      /* first check if response is available in db */
      GatlingDetails.findOne({consoleUrl: req.body.consoleUrl},function(err, GatlingDetailsResponse) {

        if (GatlingDetailsResponse) {
          res.jsonp(GatlingDetailsResponse.response);

        } else {

          getJenkinsData(req.body.consoleUrl, req.body.running, req.body.start, req.body.end, function (response) {

            if(response.status === 'fail'){

              res.send(400, {message : response.data.message})

            }else {
              res.jsonp(response);
              memcached.set(jenkinsKey, response.data, 10, function (err, result) {
                if (err)
                  console.error(err);
                memcached.end();
              });
            }
          });
        }
      });
    }
  });
};
function getJenkinsData(jenkinsUrl, running, start, end, callback) {
  var consoleResponse = {};
  var consoleData = [];
  var errorData = [];
  var consoleUrl;
  var separator;
  /*
     * we use a different url if a test is still running
     * */
  if (running === false) {
    consoleUrl = jenkinsUrl + 'console';
    separator = '&gt; ';
  } else {
    consoleUrl = jenkinsUrl + 'logText/progressiveText?start=';
    separator = '> ';
  }
  var memcached = new Memcached(config.memcachedHost);
  var client = requestjson.createClient(jenkinsUrl);
  var testDurationInSeconds, offset;
  memcached.get(consoleUrl, function (err, result) {
    if (err)
      console.error(err);
    if (result) {
      console.dir('cache hit, offset: ' + result);
      if (running === false) {
        /*no offset needed*/
        offset = '';
      } else {
        offset = result;
      }
    } else {
      if (running === false) {
        /*no offset needed*/
        offset = '';
      } else {
        /* If screen was never opened before downloading the whole console output file would lead to Jenkins out of memory
                 * in case of long lasting tests. Instead make an educated guess for a suitable offset based on the test timestamps
                 */
        testDurationInSeconds = new Date() / 1000 - start;
        offset = Math.round(testDurationInSeconds * 500);
      }
    }
    client.get(consoleUrl + offset, function (err, response, body) {
      //        if (err) console.error(err);
      console.log(consoleUrl + offset);
      console.log('X-More-Data:' + response.headers['x-more-data']);
      //if (response.headers['x-text-size'] && running == true) {
      //  memcached.set(consoleUrl, response.headers['x-text-size'], 600, function (err, result) {
      //    if (err)
      //      console.error(err);
      //    console.dir('key set ' + consoleUrl + ' : ' + response.headers['x-text-size']);
      //    memcached.end();
      //  });
      //}
      if(response.statusCode !== 200){

        consoleResponse.status = 'fail';
        consoleResponse.data = err;
        callback(consoleResponse);

      }else {

        var consoleArray = body.split('Requests');
        if (consoleArray.length > 1) {
          var consoleResultsArray = consoleArray[consoleArray.length - 1].split('sending end test run');

          var consoleLineArray = consoleResultsArray[0].split(separator);
          //            console.log(body);
          _.each(consoleLineArray, function (consoleLine, i) {
            if (i > 0) {
              var request = /(.*?)\s+\(OK.*/g.exec(consoleLine);
              if (request) {
                var OK = /.*OK=(\d+)\s+KO.*/.exec(consoleLine);
                var KO = /.*KO=(\d+).*/.exec(consoleLine);
                var percFailed = parseInt(OK[1]) + parseInt(KO[1]) > 0 ? (parseInt(KO[1]) * 100 / (parseInt(OK[1]) + parseInt(KO[1]))).toFixed(2).toString() + '%' : '0%';
                consoleData.push({
                  'request': request[1],
                  'OK': parseInt(OK[1]),
                  'KO': parseInt(KO[1]),
                  'percFailed': percFailed
                });
              } else {
                var percentageOfErrors = /.*\(\s?(\d+\.\d+%)\)\s/g.exec(consoleLine);
                if (percentageOfErrors) {
                  var error1 = /(.*?)\s+\d+\s\(\s?\d+\.\d+%\)\s/g.exec(consoleLine);
                  var error2 = /.*\s+\d+\s\(\s?\d+\.\d+%\)\s+([^\=]*)/g.exec(consoleLine);
                  var error = error2[1] ? error1[1] + error2[1] : error1[1];
                  var numberOfErrors = /.*\s+(\d+)\s\(\s?\d+\.\d+%\)/g.exec(consoleLine);
                  errorData.push({
                    'error': error,
                    'numberOfErrors': parseInt(numberOfErrors[1]),
                    'percentageOfErrors': percentageOfErrors[1]
                  });
                }
              }
            }
          });

          consoleResponse.status = 'OK';
          consoleResponse.data = consoleData;
          consoleResponse.errors = errorData;
        }
        callback(consoleResponse);

        /* if test is finished, put response  in db */
        if (running === false && consoleResponse.hasOwnProperty('data')) {

          var GatlingDetailsResponse = new GatlingDetails({consoleUrl: jenkinsUrl, response: consoleResponse});
          GatlingDetailsResponse.save(function (err, savedResponse) {
            if (err) console.log(err);
          });
        }
      }
    });
  });
}
