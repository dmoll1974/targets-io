'use strict';
angular.module('core').factory('TargetsIoHeader', [
  '$http', 'Utils',
  function ($http, Utils) {
    var TargetsIoHeader = {
      'productName': '',
      'dashboardName': ''

    };
    return TargetsIoHeader;


  }
]);
