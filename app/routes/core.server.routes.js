'use strict';
module.exports = function (app) {
  // Root routing
  var core = require('../../app/controllers/core.server.controller');
  app.route('/').get(core.index);
  app.route('/get-graylog-gui-url').get(core.getGraylogGuiUrl);

};
