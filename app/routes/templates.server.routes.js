'use strict';
module.exports = function (app) {
  var users = require('../../app/controllers/users.server.controller');
  var templates = require('../../app/controllers/templates.server.controller');
  // Templates Routes
  app.route('/templates')
      .get(templates.list)
      .post(templates.create);
  //users.requiresLogin,
  //app.route('/templates/:').get(templates.read);
  app.route('/template-by-name/:templateName')
      .get(templates.getTemplateByName);

  app.route('/templates/:templateId')
      .put(templates.update);  // users.requiresLogin, templates.hasAuthorization,
  //    .delete(templates.delete);
  //users.requiresLogin, templates.hasAuthorization,

    app.param('templateName', templates.templateByName);

    app.param('templateId', templates.templateByID);

};
