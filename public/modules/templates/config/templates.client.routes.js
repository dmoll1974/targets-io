'use strict';
//Setting up route
angular.module('templates').config([
  '$stateProvider',
  function ($stateProvider) {
    // Templates state routing
    $stateProvider/*.state('viewTemplates', {
      url: '/templates',
      templateUrl: 'modules/templates/views/templates.client.view.html'
    })*/.state('viewTemplate', {
      url: '/templates/:templateName',
      template: '<view-template></view-template>'
    }).state('addTemplate', {
          url: '/add/template',
          template: '<add-template></add-template>'
    }) .state('editTemplate', {
        url: '/add/template/:templateId',
        template: '<edit-template></edit-template>'
    }).state('addVariable', {
      url: '/add/variable',
      template: '<add-template-variable></add-template-variable>'
    });/*.state('addTemplateMetric', {
      url: '/create-template-metric',
      templateUrl: 'modules/templates/views/requirements.client.view.html'
    }).state('editTemplateMetric', {
      url: '/templates/:templateName/metric/:metricId',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    }).state('addTemplateVariable', {
      url: '/create-template-variable',
      templateUrl: 'modules/templates/views/requirements.client.view.html'
    }).state('editTemplateVariable', {
      url: '/templates/:templateName/variable/:variableId',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    })*/
  }
]);
