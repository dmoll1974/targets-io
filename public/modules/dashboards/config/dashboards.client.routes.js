'use strict';
//Setting up route
angular.module('dashboards').config([
  '$stateProvider',
  function ($stateProvider) {
    // Dashboards state routing
    $stateProvider.state('listDashboards', {
      url: ':/dashboards',
      templateUrl: 'modules/dashboards/views/list-dashboards.client.view.html'
    }).state('addDashboard', {
      url: '/add/dashboard/:productName/',
      template: '<add-dashboard></add-dashboard>'
    }).state('viewDashboard', {
      url: '/browse/:productName/:dashboardName/',
      template: '<view-dashboard></view-dashboard>'
    }).state('editDashboard', {
      url: '/edit/dashboard/:productName/:dashboardName/',
      template: '<edit-dashboard></edit-dashboard>'
    }).state('manageDashboardTags', {
      url: '/manage-tags/:productName/:dashboardName/',
      template: '<manage-dashboard-tags></manage-dashboard-tags>'
    });
  }
]);
