'use strict';

angular.module('templates').directive('mergeTemplate', MergeTemplateDirective);

function MergeTemplateDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/merge-template.client.view.html',
    controller: MergeTemplateDirectiveController
  };

  return directive;

  /* @ngInject */
  function MergeTemplateDirectiveController ($scope, $rootScope, $state, $stateParams,  $timeout, Templates, Dashboards, Metrics, Graphite) {


      $scope.addValue = addValue;
      $scope.removeValue = removeValue;
      $scope.cancel = cancel;
      $scope.removeTarget = removeTarget;
      $scope.removeMetric = removeMetric;
      $scope.preview = preview;
      $scope.merge = merge;

          /* Watches */

      $scope.$watch('template.variables', function(newValue, oldValue) {
          if(newValue !== oldValue) {

              var regExp;
              var queryVariablesReplaced;
              var valuesPerVariable;
              var totalTemplateCombinations = 1;
              var replaceValue;

              /* force get-values-from-graphite directive to destroy*/
              _.each($scope.variables, function (variable, index) {

                  $scope.variables[index].query = false;

              });

              $timeout(function(){
                  _.each($scope.template.variables, function (variable) {

                      valuesPerVariable= 0;
                      regExp = new RegExp('\\$' + variable.name, 'g');


                      if(variable.values.length > 1){

                          var valueList = '{';

                          _.each(variable.values, function (value, index) {

                              if (value !== '') {

                                  valuesPerVariable = valuesPerVariable + 1;

                                  valueList += value;
                                  if(index !== variable.values.length -1) valueList += ',';

                              }
                          });

                          valueList += '}';

                          replaceValue = valueList;



                      }else{

                          if (variable.values[0] !== '') {

                              valuesPerVariable =  1;

                              replaceValue = variable.values[0];


                          }
                      }

                      var replaceItem = {};
                      replaceItem.variable = variable.name;
                      replaceItem.placeholder = regExp;
                      replaceItem.replace = replaceValue;

                      var index = Templates.replaceItems.map(function(replaceItem){ return replaceItem.variable;}).indexOf(variable.name);

                      if(index === -1){
                          Templates.replaceItems.push(replaceItem);
                      }else{
                          Templates.replaceItems[index] = replaceItem;
                      }


                      if(valuesPerVariable > 0) totalTemplateCombinations = totalTemplateCombinations * valuesPerVariable;
                  });

                  $scope.totalTemplateCombinations = totalTemplateCombinations;

                  _.each($scope.template.variables, function (variable, index) {

                      queryVariablesReplaced =  replacePlaceholders(variable.query, Templates.replaceItems);

                      /* only replace variables in query when the new query returns results */
                      Graphite.findMetrics(queryVariablesReplaced).success(function(graphiteTargetsLeafs) {


                          if(graphiteTargetsLeafs.length > 0) {

                              $scope.template.variables[index].dynamicQuery = replacePlaceholders(variable.query, Templates.replaceItems);

                          }
                      });

                  });
              },0);
          }
      }, true);


      /* activate */

      activate();

      /* functions */

      function activate() {

          Templates.get($stateParams.templateName).success(function (template) {

              $scope.template = template;

              //$timeout(function(){


              _.each($scope.template.variables, function (variable, index) {

                  $scope.template.variables[index].values = [];

                  _.each(Templates.mergeData, function (mergeData) {

                      if (variable.name === mergeData.variable) {
                          $scope.template.variables[index].values.push(mergeData.value);
                      }
                  })

                  if ($scope.template.variables[index].values.length === 0) {
                      $scope.template.variables[index].values.push('');
                  }
              })
          });
      }

      function addValue(index) {

          $scope.template.variables[index].values.push('');

      };

      function removeValue(parentIndex, index) {

          $scope.template.variables[parentIndex].values.splice(index, 1);

      };



      function cancel() {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };

      function removeTarget(parentIndex, index){

          $scope.metrics[parentIndex].targets.splice(index, 1);
      };

      function removeMetric(index){

          $scope.metrics.splice(index, 1);
      };

      function replacePlaceholders(target, replaceArray){

          _.each(replaceArray, function(replaceItem){

                  target = target.replace(replaceItem.placeholder, replaceItem.replace);

          });

          return target;
      }

      function preview(){

          $scope.metrics = [];
          var decoratedTargets = [];
          var decoratedTags = [];

          var regExp;

          var variableArray = [];

          _.each($scope.template.variables, function(variable){

              if(variableArray.indexOf(variable.name) === -1){

                  variableArray.push({
                      name: variable.name,
                      replaceItems:[]
                  })
              }

              _.each(variable.values, function(value){

                  var index = variableArray.map(function(e) { return e.name; }).indexOf(variable.name);
                  regExp = new RegExp('\\$' + variable.name, 'g');
                  variableArray[index].replaceItems.push({placeholder: regExp, replace: value});

                  /* add variable values to Template service for later re use*/

                  var mergeDataItem = {};
                  mergeDataItem.variable = variable.name;
                  mergeDataItem.value = value;

                  /* check if item already exists */
                  var exists = false;
                   _.each(Templates.mergeData, function(existingItem){

                      if(mergeDataItem.variable === existingItem.variable && mergeDataItem.value === existingItem.value){
                          exists = true;
                          return;
                      }

                  });

                  if (exists === false) Templates.mergeData.push(mergeDataItem);

              })

          });

          var replaceArray = [];
          var replace1, replace2, replace3, replace4, replace5;

          for(var j=0; j < variableArray[0].replaceItems.length; j++) {

              replace1 = variableArray[0].replaceItems[j];

              if(variableArray.length > 1) {


                      for (var l = 0; l < variableArray[1].replaceItems.length; l++) {

                          replace2 = variableArray[1].replaceItems[l];

                          if(variableArray.length > 2) {


                                  for (var n = 0; n < variableArray[2].replaceItems.length; n++) {

                                      replace3 = variableArray[2].replaceItems[n];

                                      if(variableArray.length > 3) {


                                              for (var p = 0; p < variableArray[3].replaceItems.length; n++) {

                                                  replace4 = variableArray[3].replaceItems[p];

                                                  if(variableArray.length > 4) {


                                                          for (var r = 0; r < variableArray[4].replaceItems.length; n++) {

                                                              replace5 = variableArray[4].replaceItems[r];
                                                              replaceArray.push([replace1, replace2, replace3, replace4, replace5]);


                                                          }

                                                  }else{

                                                      replaceArray.push([replace1, replace2, replace3, replace4]);

                                                  }
                                              }

                                      }else{

                                          replaceArray.push([replace1, replace2, replace3]);

                                      }

                                  }
                          }else{
                              replaceArray.push([replace1, replace2]);

                          }
                      }

              }else{
                  replaceArray.push([replace1]);

              }

          }


          console.log('*******************************************************');
          _.each(replaceArray, function(replaceArrayItem){

              console.log('*******************************************************');

              _.each(replaceArrayItem, function(replace){


                  console.log('placeholder: ' + replace.placeholder);
                     console.log('replace: ' + replace.replace);


                 })

          });




          _.each($scope.template.metrics, function(metric){


              _.each(replaceArray, function(replaceItem){

                  metric.alias = replacePlaceholders(metric.alias, replaceItem);

              })

              _.each(metric.targets, function(target){

                  _.each(replaceArray, function(replaceItem){

                      decoratedTargets.push(replacePlaceholders(target, replaceItem));

                  })
              })

              _.each(metric.tags, function(tag){

                  _.each(replaceArray, function(replaceItem){

                      var tagIndex = decoratedTags.map(function(decoratedTag){return decoratedTag._id.toString()}).indexOf(tag._id.toString());
                      if(tagIndex === -1){

                          decoratedTags.push( {_id: tag._id, text: replacePlaceholders(tag.text, replaceItem)});

                      }else{

                          decoratedTags[index] = {_id: tag._id, text: replacePlaceholders(tag.text, replaceItem)};
                      }



                  })

              })

              $scope.metrics.push(
                  {
                      productName: Dashboards.selected.productName,
                      dashboardId: Dashboards.selected._id,
                      dashboardName: Dashboards.selected.name,
                      alias: metric.alias,
                      targets: decoratedTargets,
                      tags: decoratedTags,
                      benchmarkValue: metric.benchmarkValue,
                      benchmarkOperator: metric.benchmarkOperator,
                      requirementValue: metric.requirementValue,
                      requirementOperator: metric.requirementOperator,
                      unit: metric.unit
                  });

              decoratedTargets = [];
              decoratedTags = [];

          })


      }

      function merge() {



          var productName = Dashboards.selected.productName;
          var dashboardName = Dashboards.selected.name;


              _.each($scope.metrics, function (metric, index) {


              /* Update tags in Dashboard if any new are added */
              Dashboards.updateTags(Dashboards.selected.productName, Dashboards.selected.dashboardName, metric.tags, function (tagsUpdated) {

                  if (tagsUpdated)
                      Dashboards.update(Dashboards.selected).success(function (dashboard) {
                      });
              });


              Metrics.create(metric).success(function (metric) {

              });


          });

          setTimeout(function(){

              /* reset Dashboards.selected to force reload from db */

              Dashboards.selected ={};

              /* Go to metrics tab */
              Dashboards.selectedTab = 1;

              /* reset Templates.replaceItems*/
                Templates.replaceItems = [];

              $state.go('viewDashboard', {
                  'productName': productName,
                  'dashboardName': dashboardName
              });

          },500);


      }
  }
}
