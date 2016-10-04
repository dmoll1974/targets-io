'use strict';
module.exports = function (app) {
  var exportDb = require('../../app/controllers/export-db.server.controller');
  // Events Routes
  //app.route('/import-db')
  //    .get(importDb.dbImport);
  app.route('/download').get(exportDb.dbExport);
  app.route('/download/:product').get(exportDb.dbExportForProduct);
  app.route('/download-template/:templateName').get(exportDb.dbExportTemplate);
};
