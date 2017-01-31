'use strict';
/**
 * Module dependencies.
 */
var config = require('../../config/config');

exports.index = index;
exports.getGraylogGuiUrl = getGraylogGuiUrl;


function getGraylogGuiUrl(req, res){

  res.jsonp({guiUrl: config.graylog.guiUrl});
}

function index (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

  res.render('index', {
    user: req.user || null,
    request: req
  });
};
