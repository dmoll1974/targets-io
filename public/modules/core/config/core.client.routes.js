'use strict';
// Setting up route
angular.module('core', ['dashboards']).config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    })
    .state('gettingStarted', {
      url: '/',
      templateUrl: 'modules/core/views/getting-started.client.view.html'
    });
  }
]);
