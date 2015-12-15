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
  function MergeTemplateDirectiveController ($scope, $rootScope, $state, $timeout, Templates, Dashboards, Metrics, Graphite) {

      $scope.template = Templates.selected;

      _.each($scope.template.variables, function(variable, index){

          $scope.template.variables[index].values = [];
          $scope.template.variables[index].values.push('');

      })



      $scope.addValue = function (index) {
          $scope.template.variables[index].values.push('');
      };
      $scope.removeValue = function (parentIndex, index) {
          $scope.template.variables[parentIndex].values.splice(index, 1);
      };

      $scope.$watch('template.variables', function(newValue, oldValue) {
          if(newValue !== oldValue) {

              var regExp;
              var queryVariablesReplaced;
              var valuesPerVariable;
              var totalTemplateCombinations = 1;


              /* force get-values-from-graphite directive to destroy*/
              _.each($scope.variables, function (variable, index) {

                  $scope.variables[index].query = false;

              });

              $timeout(function(){
              _.each($scope.template.variables, function (variable) {

                  valuesPerVariable= 0;

                  _.each(variable.values, function (value) {

                      if (value !== '') {

                          valuesPerVariable = valuesPerVariable + 1;

                          regExp = new RegExp('\\$' + variable.name, 'g');
                          Templates.replaceItems.push({variable: variable.name, placeholder: regExp, replace: value});
                      }
                  });

                  if(valuesPerVariable > 0) totalTemplateCombinations = totalTemplateCombinations * valuesPerVariable;
              });

              $scope.totalTemplateCombinations = totalTemplateCombinations;

              _.each($scope.template.variables, function (variable, index) {

                  queryVariablesReplaced =  replacePlaceholders(variable.query, Templates.replaceItems);

                  /* only replace variables in query when the new query returns results */
                  Graphite.findMetrics(queryVariablesReplaced).success(function(graphiteTargetsLeafs) {


                      if(graphiteTargetsLeafs.length > 0) {

                          $scope.template.variables[index].query = replacePlaceholders(variable.query, Templates.replaceItems);

                      }
                  });

              });
              },0);
          }
      }, true);


      $scope.cancel = function () {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };

      $scope.removeTarget = function(parentIndex, index){

          $scope.metrics[parentIndex].targets.splice(index, 1);
      };

      $scope.removeMetric = function(index){

          $scope.metrics.splice(index, 1);
      };

      function replacePlaceholders(target, replaceArray){

          _.each(replaceArray, function(replaceItem){

              target = target.replace(replaceItem.placeholder, replaceItem.replace);

          });

          return target;
      }

      $scope.preview = function(){

          $scope.metrics = [];
          var targets = [];
          var regExp;


          //var variables=[
          //
          //    {
          //        name: 'EERSTE',
          //        description: 'Eerste variabele',
          //        values: [
          //            'A',
          //            'B'
          //        ]
          //    },
          //    {
          //        name: 'TWEEDE',
          //        description: 'Tweede variabele',
          //        values: [
          //            'A',
          //            'B'
          //        ]
          //    },
          //    {
          //        name: 'DERDE',
          //        description: 'Derde variabele',
          //        values: [
          //            'A',
          //            //'B'
          //        ]
          //    },
          //
          //];

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

              })

          });

          //_.each(variableArray, function(variableArrayItem){
          //
          //    console.log('name: ' + variableArrayItem.name)
          //    _.each(variableArrayItem.replaceItems, function(replaceValue) {
          //
          //        console.log(replaceValue);
          //        //console.log('placeholder: ' + replaceValue.placeholder);
          //        //console.log('replace: ' + replaceValue.replace);
          //    });
          //
          //});


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

              _.each(metric.targets, function(target){

                  _.each(replaceArray, function(replaceItem){

                          targets.push(replacePlaceholders(target, replaceItem));

                  })

                  $scope.metrics.push(
                      {
                          productName: Dashboards.selected.productName,
                          dashboardId: Dashboards.selected._id,
                          dashboardName: Dashboards.selected.name,
                          alias: metric.alias,
                          targets: targets,
                          tags: metric.tags,
                          benchmarkValue: metric.benchmarkValue,
                          benchmarkOperator: metric.benchmarkOperator,
                          requirementValue: metric.requirementValue,
                          requirementOperator: metric.requirementOperator
                      });

                  targets = [];

              })

          })


      }

      $scope.merge = function() {

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
