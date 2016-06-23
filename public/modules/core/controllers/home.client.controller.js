'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  'mySocket',
  function ($scope, Authentication, mySocket) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    mySocket.emit('room', 'recent-test');
    console.log('Joined recent-test room from controller');

    mySocket.emit('room', 'running-test');
    console.log('Joined running-test room from controller');
  }
]);
