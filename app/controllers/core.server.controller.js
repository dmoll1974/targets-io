'use strict';
/**
 * Module dependencies.
 */
exports.index = function (req, res) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  res.render('index', {
    user: req.user || null,
    request: req
  });
};
