'use strict';
//Setting up route
angular.module('templates').config([
  '$stateProvider',
  function ($stateProvider) {
    // Templates state routing
    $stateProvider.state('viewTemplates', {
      url: '/templates',
      templateUrl: 'modules/templates/views/templates.client.view.html'
    }).state('createTemplate', {
      url: '/create-template',
      templateUrl: 'modules/templates/views/requirements.client.view.html'
    }).state('editTemplate', {
      url: '/templates/:templateName',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    }).state('createTemplateMetric', {
      url: '/create-template-metric',
      templateUrl: 'modules/templates/views/requirements.client.view.html'
    }).state('editTemplateMetric', {
      url: '/templates/:templateName/metric/:metricId',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    }).state('createTemplateVariable', {
      url: '/create-template-variable',
      templateUrl: 'modules/templates/views/requirements.client.view.html'
    }).state('editTemplateVariable', {
      url: '/templates/:templateName/variable/:variableId',
      templateUrl: 'modules/templates/views/benchmark-previous-build.client.view.html'
    });
  }
]);
