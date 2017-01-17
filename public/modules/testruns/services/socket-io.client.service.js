'use strict';
//Events service used to communicate Events REST endpoints
angular.module('testruns').
//factory('mySocket', function (socketFactory) {
//
//  var mySocket = socketFactory({
//    transports:['websocket']
//  });
//
//  return mySocket;
//
//
//});
factory('mySocket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    disconnect: function (eventName, data, callback) {
      socket.disconnect(function () {
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket);
          }
        });
      })
    }
  };
});
