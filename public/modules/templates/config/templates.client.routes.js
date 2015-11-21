'use strict';
//Setting up route
angular.module('templates').config([
  '$stateProvider',
  function ($stateProvider) {
    // Templates state routing
    $stateProvider.state('viewTemplates', {
      url: '/templates',
      template: '<view-templates></view-templates>'
    }).state('viewTemplate', {
      url: '/templates/:templateName',
      template: '<view-template></view-template>'
    }).state('addTemplate', {
          url: '/add/template',
          template: '<add-template></add-template>'
    }) .state('editTemplate', {
        url: '/edite/template/:templateId',
        template: '<edit-template></edit-template>'
    }).state('addVariable', {
      url: '/add/template-variable',
      template: '<add-template-variable></add-template-variable>'
    }).state('editTemplateVariable', {
      url: '/edit/template-variable/:variableId',
      template: '<edit-template-variable></edit-template-variable>'
    }).state('addTemplateMetric', {
      url: '/add/template-metric',
      template: '<add-template-metric></add-template-metric>'
    }).state('editTemplateMetric', {
      url: '/edit/template-metric/:metricId',
      template: '<edit-template-metric></edit-template-metric>'
    }).state('mergeTemplate', {
      url: '/merge/template',
      template: '<merge-template></merge-template>'
    });/*.state('editTemplateVariable', {
      url: '/templates/:templateName/variable/:variableId',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    })*/
  }
]);
