'use strict';
//Metrics service used to communicate Metrics REST endpoints
angular.module('metrics').factory('Metrics', [
  '$http', 'Utils',
  function ($http, Utils) {
    var Metrics = {
      //            items : [],
      'get': getFn,
      update: update,
      delete: deleteFn,
      create: create,
      selected: {},
      clone: {},
      removeTag: removeTag,
      metricFilter: ''
    };
    return Metrics;
    function getFn(metricId) {
      return $http.get('/metrics/' + metricId);
    }
    function deleteFn(metricId) {
      return $http.delete('/metrics/' + metricId);
    }
    function create(metric) {
      metric.tags = metric.tags.sort(Utils.dynamicSort('text'));
      return $http.post('/metrics', metric).success(function (metric) {
      });
    }
    function update(metric) {
      metric.tags = metric.tags.sort(Utils.dynamicSort('text'));
      return $http.put('/metrics/' + metric._id, metric).success(function (metric) {
      });
    }
    function removeTag(metricId, removeTag) {
      var updatedTags = [];
      $http.get('/metrics/' + metricId).success(function (metric) {
        _.each(metric.tags, function (tag, i) {
          if (tag.text !== removeTag)
            updatedTags.push(tag);
        });
        metric.tags = updatedTags;
        return $http.put('/metrics/' + metric._id, metric);
      });
    }
  }
]);
