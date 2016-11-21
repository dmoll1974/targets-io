'use strict';

angular.module('testruns').directive('testrunSummary', TestRunSummaryDirective);

function TestRunSummaryDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/testruns/directives/testrun-summary.client.view.html',
    controller: TestRunSummaryDirectiveController
  };

  return directive;

  /* @ngInject */
  function TestRunSummaryDirectiveController ($scope, $state, TestRuns, $filter, $rootScope, $stateParams, Dashboards, Utils, Metrics, TestRunSummary, $mdToast, $modal, ConfirmModal, $timeout, Events) {


    $scope.markAsUpdated = markAsUpdated;
    $scope.openMenu = openMenu;
    $scope.restoreDefaultAnnotation = restoreDefaultAnnotation;
    $scope.setDefaultAnnotation = setDefaultAnnotation;
    $scope.deleteFromTestRunSummary = deleteFromTestRunSummary;
    $scope.gatlingDetails = gatlingDetails;
    $scope.editMetric = editMetric;
    $scope.testRunDetails = testRunDetails;
    $scope.testRunSummaryConfig = testRunSummaryConfig;
    $scope.addMetricToTestRunSummary = addMetricToTestRunSummary;
    $scope.submitTestRunSummary = submitTestRunSummary;
    $scope.hasFlash = hasFlash;
    $scope.clipClicked = clipClicked;
    $scope.setTestRunSummaryUrl = setTestRunSummaryUrl;
    $scope.openDeleteModal = openDeleteModal;
    $scope.saveAsPDF = saveAsPDF;

    /* Watches */

    var converter = new showdown.Converter({extensions: ['targetblank']});

    $scope.$watch('testRunSummary.markDown', function (newVal, oldVal) {

      if (newVal !== undefined) {

        var markDownToHTML = converter.makeHtml(newVal);

        $timeout(function () {

          document.getElementById('markdown').innerHTML = markDownToHTML;

        }, 100)
      }
    });

    $scope.$watch('editMode', function (newVal, oldVal) {

      if (newVal === false) {

        $scope.hideGraphs = false;
      }
    });

    $scope.$on('$destroy', function () {
      /* if updates have been made and not saved, prompt the user */
      if($scope.updated === true  && !$rootScope.currentState.includes('testRunSummary')){

        ConfirmModal.itemType = 'Save changes to test run summary ';
        ConfirmModal.selectedItemDescription =  $scope.testRunSummary.testRunId;
        var modalInstance = $modal.open({
          templateUrl: 'ConfirmDelete.html',
          controller: 'ModalInstanceController',
          size: ''  //,
        });
        modalInstance.result.then(function () {
          submitTestRunSummaryImpl()
        }, function () {

          /* return to previous state*/
          //$state.go($rootScope.previousState, $rootScope.previousStateParams);

        });
      }
    });


    /* activate */

    activate();

    /* functions */

    function activate() {

      Utils.graphType = 'testrun';

      $scope.testRunSummary = {};
      $scope.testRunSummary.requirements = [];
      /* if coming from edit metric screen, set edit mode and updated to true */
      $scope.editMode = $rootScope.previousState.includes('editMetric') ? true : false;
      $scope.updated = $rootScope.previousState.includes('editMetric') ? true : false;
      $scope.hideGraphs = false;
      $scope.showSpinner = false;


      $scope.dragControlListeners = {
        accept: $scope.editMode && $scope.hideGraphs,
        itemMoved: function () {
          $scope.updated = true;
        },
        orderChanged: updateMetricOrder
      };

      TestRunSummary.getTestRunSummary($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (response) {


        if(response.testRunSummary){

          $scope.testRunSummary = response.testRunSummary;

          $scope.summarySaved = true;

          if(response.hasBeenUpdated){
            $scope.updated = true;
            $scope.editMode = true;

            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top center')
                .parent(angular.element('#summary-buttons'))
                .hideDelay(6000);

            $mdToast.show(toast.content('Test run summary was updated based on new metric configuration, save to persist!')).then(function(response) {

            });


          }

        }else {

          $scope.summarySaved = false;

          createTestRunSummary (false);
        }
      });

      /* get list of metrics not yet in test run summary */
      Dashboards.listMetricsNotInTestRunSummary($stateParams.productName, $stateParams.dashboardName).success(function(metricsToAdd){

        $scope.metricsToAdd = metricsToAdd;

      })

    }

    function updateMetricOrder(event){

      $scope.updated = true;
      _.each($scope.testRunSummary.metrics, function(testRunSummaryMetric, i){

        testRunSummaryMetric.summaryIndex = i;
        Metrics.update(testRunSummaryMetric).success(function(){

        })
      })
    }


    function markAsUpdated(){

      $scope.updated = true;
    }



    /* initialise menu */

    var originatorEv;

    function openMenu($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);

    };


    function createTestRunSummary (update){

      /* get test run info */

      TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {

        $scope.testRunSummary.productName = testRun.productName;
        $scope.testRunSummary.productRelease = testRun.productRelease;
        $scope.testRunSummary.dashboardName = testRun.dashboardName;
        $scope.testRunSummary.testRunId = testRun.testRunId;
        $scope.testRunSummary.start = testRun.start;
        $scope.testRunSummary.end = testRun.end;
        $scope.testRunSummary.humanReadableDuration = testRun.humanReadableDuration;
        $scope.testRunSummary.annotations = (testRun.annotations)? testRun.annotations : 'None';
        if (testRun.buildResultsUrl){
          $scope.testRunSummary.buildResultsUrl = testRun.buildResultsUrl;
          /* in case of Jenkins CI server, get last two url parameters to display */
          var splitbuildResultsUrl = testRun.buildResultsUrl.split('/');
          $scope.testRunSummary.buildResultsUrlDisplay = splitbuildResultsUrl[splitbuildResultsUrl.length -3] + ' #' + splitbuildResultsUrl[splitbuildResultsUrl.length -2];
        }



        /* get dashboard info */

        Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {

          $scope.testRunSummary.description = dashboard.description;
          $scope.testRunSummary.goal = dashboard.goal;

          /* add requirements */
          addRequirements(testRun.metrics, dashboard.metrics);


          if (update === true){

            var newTestRunSummaryMetrics = [];

            newTestRunSummaryMetrics = getNewMetrics(dashboard.metrics, $scope.testRunSummary.metrics);

            _.each(addMetricsToSummary(newTestRunSummaryMetrics), function(newMetric){

              newMetric.summaryText = (newMetric.defaultSummaryText) ? newMetric.defaultSummaryText : '';
              $scope.testRunSummary.metrics.push(newMetric);

            })


            $scope.updated = true;

          }else{

            /* Add metrics*/

            $scope.testRunSummary.metrics = addMetricsToSummary(dashboard.metrics);

            /* add default annotation texts to model */

            _.each($scope.testRunSummary.metrics, function (metric) {

              metric.summaryText = (metric.defaultSummaryText) ? metric.defaultSummaryText : '';

            })



          }



        });


      });

    }

    function getNewMetrics(testRunMetrics, testRunSummaryMetrics){

      var newMetrics = [];

      _.each(testRunMetrics, function(testRunMetric){

        var index = testRunSummaryMetrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(testRunMetric._id);

        if(index === -1 && testRunMetric.includeInSummary === true ) newMetrics.push(testRunMetric);


      })

      return newMetrics;
    }

    function restoreDefaultAnnotation(metric){

      Metrics.get(metric._id).success(function(storedMetric){

        var index =  $scope.testRunSummary.metrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(storedMetric._id);

        $scope.testRunSummary.metrics[index].summaryText = storedMetric.defaultSummaryText;

        var toast = $mdToast.simple()
            .action('OK')
            .highlightAction(true)
            .position('bottom center')
            //.parent(angular.element('#addMetric'))
            .hideDelay(3000);

        $mdToast.show(toast.content('Default annotation has been restored for ' + metric.alias.toUpperCase())).then(function(response) {
        $scope.updated = true;

        })
      })
    }

    function setDefaultAnnotation(metric){

      Metrics.get(metric._id).success(function(storedMetric){

        storedMetric.defaultSummaryText = metric.summaryText;
        Metrics.update(storedMetric).success(function(updatedMetric){

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('bottom center')
              //.parent(angular.element('#addMetric'))
              .hideDelay(3000);

          $mdToast.show(toast.content('Default annotation set for ' + updatedMetric.alias.toUpperCase())).then(function(response) {

          });

        });
      })
    }

    function deleteFromTestRunSummary(metric){

      var index =  $scope.testRunSummary.metrics.map(function(testRunSummaryMetric){return testRunSummaryMetric._id;}).indexOf(metric._id);

      $scope.testRunSummary.metrics.splice(index, 1);

      var toast = $mdToast.simple()
          .action('OK')
          .highlightAction(true)
          .position('bottom center')
          //.parent(angular.element('#addMetric'))
          .hideDelay(3000);

      $mdToast.show(toast.content(metric.alias.toUpperCase() + ' removed from test run summary' )).then(function(response) {

      });

      /* Add metric to metrics to add */

      $scope.metricsToAdd.push(metric);
      $scope.metricsToAdd.sort(Utils.dynamicSort('alias'));

      $scope.updated = true;
    }

    function gatlingDetails(testRunId){

      $state.go('viewGraphs', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName,
        'testRunId': testRunId,
        'tag': 'Gatling'
      });
    }

    function addMetricsToSummary(dashboardMetrics) {

      var summaryIndex = 0;
      var metricsInSummary = [];

      _.each(dashboardMetrics, function (dashboardMetric, i) {

        /* add initial summaryIndeces */

        if(dashboardMetric.includeInSummary === true ) {

          if (!dashboardMetric.summaryIndex) {


            dashboardMetric.summaryIndex = summaryIndex;
            summaryIndex++;
            Metrics.update(dashboardMetric).success(function (metric) {

            });
          }

          metricsInSummary.push(dashboardMetric);
        }

      });

      return metricsInSummary.sort(Utils.dynamicSort('summaryIndex'));

    }

    function addRequirements(testRunMetrics, dashboardMetrics){

      if($scope.testRunSummary.requirements.length > 0) $scope.testRunSummary.requirements = [];

      _.each(dashboardMetrics, function (dashboardMetric, i) {

          _.each(testRunMetrics, function (testRunMetric) {

            if(dashboardMetric.alias === testRunMetric.alias && testRunMetric.meetsRequirement !== null){

              dashboardMetric.meetsRequirement = testRunMetric.meetsRequirement;

              var requirementText =  dashboardMetric.requirementOperator == "<" ? dashboardMetric.alias + ' should be lower than ' + dashboardMetric.requirementValue : dashboardMetric.alias + ' should be higher than ' + dashboardMetric.requirementValue;

              var tag = dashboardMetric.tags.length > 0 ? dashboardMetric.tags[0].text : 'All';

              $scope.testRunSummary.requirements.push({metricAlias: dashboardMetric.alias, tag: tag, requirementText: requirementText, meetsRequirement:testRunMetric.meetsRequirement });
            }


          });
      });
    }




    function editMetric(metricId){

      $state.go('editMetric',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName, metricId: metricId });

    };

    function testRunDetails(testRun, requirement) {
      TestRuns.selected = testRun;

      if (requirement === 'all')
        {

          $state.go('viewGraphs', {
            'productName': $stateParams.productName,
            'dashboardName': $stateParams.dashboardName,
            'testRunId': testRun.testRunId,
            tag: Dashboards.getDefaultTag(Dashboards.selected.tags)
          });
        }else{

        $state.go('viewGraphs', {
          'productName': $stateParams.productName,
          'dashboardName': $stateParams.dashboardName,
          'testRunId': testRun.testRunId,
          tag: requirement.tag,
          metricFilter: requirement.metricAlias
        });


      }


    };

    function testRunSummaryConfig(){

      $state.go('testRunSummaryConfig', {
        'productName': $stateParams.productName,
        'dashboardName': $stateParams.dashboardName
      });
    }


    function addMetricToTestRunSummary(addMetric){

        $scope.testRunSummary.metrics.push(addMetric);

        var toast = $mdToast.simple()
            .action('OK')
            .highlightAction(true)
            .position('bottom center')
            //.parent(angular.element('#addMetric'))
            .hideDelay(3000);

        $mdToast.show(toast.content(addMetric.alias.toUpperCase() + ' added to test run summary' )).then(function(response) {

        });


        /* remove metric from menu items */
          var index= $scope.metricsToAdd.map(function(metricToAdd){return metricToAdd._id.toString()}).indexOf(addMetric._id.toString());
        $scope.metricsToAdd.splice(index, 1);

        $scope.updated = true;
    }

    function submitTestRunSummary() {

      submitTestRunSummaryImpl();
    }



    function submitTestRunSummaryImpl(){

    /* update metric default annotations */

        _.each($scope.testRunSummary.metrics, function(testRunSummaryMetric, i){

          Metrics.get(testRunSummaryMetric._id).success(function(metric){

            if(metric.defaultSummaryText === '' || metric.defaultSummaryText === undefined ||  metric.includeInSummary === false) { //in case metrics are added via the add metric button
              metric.defaultSummaryText = testRunSummaryMetric.summaryText;
              metric.includeInSummary = true;
              Metrics.update(metric).success(function(updatedMetric){});
            }


          })

        })


        if ($scope.summarySaved === false) {


          TestRunSummary.addTestRunSummary($scope.testRunSummary).success(function(savedTestRunSummary){


            $scope.summarySaved = true;
            $scope.updated  = false;

            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top center')
                .parent(angular.element('#summary-buttons'))
                .hideDelay(6000);

            $mdToast.show(toast.content('Test run summary saved')).then(function(response) {

            });

          })

        } else {



          TestRunSummary.updateTestRunSummary($scope.testRunSummary).success(function(updatedTestRunSummary){


            $scope.summarySaved = true;
            $scope.updated  = false;


            var toast = $mdToast.simple()
                .action('OK')
                .highlightAction(true)
                .position('top center')
                .parent(angular.element('#summary-buttons'))
                .hideDelay(6000);

            $mdToast.show(toast.content('Test run summary updated')).then(function(response) {

            });

          })

        }

    }




    function hasFlash() {
      var hasFlash = false;
      try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
          return hasFlash;
        }
      } catch (e) {
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };

    /* Zero copied logic */
    function clipClicked() {
      $scope.testRunSummaryUrl = false;
    };

    /* generate deeplink to share view */

    function setTestRunSummaryUrl() {

      $scope.testRunSummaryUrl = 'http://' + location.host + '/#!/testrun-summary/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.testRunId +  '/';

    };



    function saveAsPDF(){


      $scope.showSpinner = true;

      /* get events first */

      Events.listEventsForTestRunId($scope.testRunSummary.productName, $scope.testRunSummary.dashboardName, $scope.testRunSummary.testRunId).success(function(events) {



        var docDefinition = {};

        docDefinition['content'] = [];

        docDefinition['pageBreakBefore'] =
          function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
            if( currentNode.headlineLevel === 1 && currentNode.id ) {
              return currentNode.headlineLevel === 1 && followingNodesOnPage.length < 3 + (parseInt(currentNode.id) + 1) * 3; //Hack to deal with dynamic size of legend
            }else{
              return currentNode.headlineLevel === 1 && followingNodesOnPage.length < 4; //for normal headlines
            }
          }


        docDefinition['styles'] = {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 10, 10]

          },
          subheader: {
            fontSize: 12,
            bold: true,
            margin: [0, 10, 0, 10]

          },
          metricheader: {
            fontSize: 10,
            bold: true,
            margin: [0, 10, 0, 10]

          },
          tableHeader: {
            fontSize: 8,
            bold: true,

          },
          image: {
            margin: [0, 0, 10, 10]
          },
          small: {
            fontSize: 8,
            margin: [0, 0, 10, 10]

          },
          smallNoMargin: {
            fontSize: 8,

          },
          legend: {
            fontSize: 6,
          },
          legendHeader: {
            fontSize: 6,
            bold: true
          },
          table: {
            fontSize: 8,
            margin: [0, 0, 10, 10]
          },
          bold: {
            bold: true

          }
        }

        var stack = []

        docDefinition['content'].push({text: 'Test run summary', style: 'header'});
        docDefinition['content'].push({text: 'Test run info', style: 'subheader'});

        /* create test run info table */

        var testRunInfoTable = {};
        testRunInfoTable['body'] = [];
        testRunInfoTable['body'].push([{text: 'Product', style: 'bold'}, $scope.testRunSummary.productName]);
        testRunInfoTable['body'].push([{text: 'Release', style: 'bold'}, $scope.testRunSummary.productRelease]);
        testRunInfoTable['body'].push([{text: 'Dashboard', style: 'bold'}, $scope.testRunSummary.dashboardName]);
        testRunInfoTable['body'].push([{text: 'Description', style: 'bold'}, $scope.testRunSummary.description]);
        if($scope.testRunSummary.goal){
          testRunInfoTable['body'].push([{text: 'Goal', style: 'bold'}, $scope.testRunSummary.goal]);
        }
        testRunInfoTable['body'].push([{text: 'Test run ID', style: 'bold'}, $scope.testRunSummary.testRunId]);
        testRunInfoTable['body'].push([{
          text: 'Period',
          style: 'bold'
        }, new Date($scope.testRunSummary.start).toISOString().split('.')[0].replace('T', ' ') + ' - ' + new Date($scope.testRunSummary.end).toISOString().split('.')[0].replace('T', ' ')]);
        testRunInfoTable['body'].push([{text: 'Duration', style: 'bold'}, $scope.testRunSummary.humanReadableDuration]);
        if($scope.testRunSummary.annotations && $scope.testRunSummary.annotations !== 'None'){
          testRunInfoTable['body'].push([{text: 'Annotations', style: 'bold'}, $scope.testRunSummary.annotations]);
        }



        stack.push({
          style: 'table',
          table: testRunInfoTable,
          layout: 'noBorders'
        });

      /* Markdown */

      if($scope.testRunSummary.markDown){

         _.each(splitAndStyleMarkdown($scope.testRunSummary.markDown), function(markDownLine){

          stack.push({text: markDownLine.text, style: markDownLine.style});

        })

      }

      function splitAndStyleMarkdown(markDown){

        var splitAndStyledMarkDownLines = [];

        var markDownLines = markDown.split('\n');

        var subheaderRegex = new RegExp('####.*');

        _.each(markDownLines, function(markDownLine){

          /* remove all markdown characters except for headers */

          markDownLine = markDownLine.replace(/\*/g, '').replace( /\>/g, '').replace(/\`/g, '');

            if (subheaderRegex.test(markDownLine)) {

              splitAndStyledMarkDownLines.push({text: markDownLine.split('####')[1], style: 'subheader'})
            } else {

              splitAndStyledMarkDownLines.push({text: markDownLine, style: 'smallNoMargin'})
            }

        })

        return splitAndStyledMarkDownLines;
      }

        stack.push({text: 'Requirements', style: 'subheader'});

        /* create requirements table */

        if ($scope.testRunSummary.requirements.length > 0) {

          var requirementsTable = {};
          requirementsTable['body'] = [];
          requirementsTable['body'].push([{text: 'Requirement', style: 'tableHeader'}, {
            text: 'Result',
            style: 'tableHeader'
          }]);

          _.each($scope.testRunSummary.requirements, function (requirement) {

            requirementsTable['body'].push([{text: requirement.requirementText}, {text: (requirement.meetsRequirement) ? 'OK' : 'NOK',  style: 'smallNoMargin'}]);

          })

          stack.push({
            style: 'table',
            table: requirementsTable,
            layout: 'lightHorizontalLines'
          });


        }

        /* Events table */


        if (events.length > 0) {

          stack.push({text: 'Events', style: 'subheader'});

          var eventsTable = {};
          eventsTable['body'] = [];
          eventsTable['body'].push([{text: 'Event', style: 'tableHeader'}, {
            text: 'Timestamp',
            style: 'tableHeader'
          }, {text: 'Description', style: 'tableHeader'}]);

          _.each(events, function (event, i) {

            eventsTable['body'].push([{text: (i + 1).toString(), style: 'smallNoMargin'}, {text: new Date(event.eventTimestamp).toISOString().split('.')[0].replace('T', ' '), style: 'smallNoMargin'}, {text: event.eventDescription, style: 'smallNoMargin'}]);

          })


          stack.push({
            style: 'table',
            table: eventsTable,
            layout: 'lightHorizontalLines'
          });

        }


        docDefinition['content'].push(stack);

        /* Metrics */
        docDefinition['content'].push({text: 'Metrics', style: 'subheader', headlineLevel: 1});


        _.each($scope.testRunSummary.metrics, function (metric) {

          var legendTable = {};
          legendTable['body'] = [];
          legendTable['body'].push([{text: 'Metric', style: 'legendHeader'},{text: 'Min', style: 'legendHeader'},{text: 'Max', style: 'legendHeader'},{text: 'Avg', style: 'legendHeader'}]);

          _.each(metric.legendData, function (legendData) {

            if((legendData.min || legendData.min === 0) && legendData.avg !== null ) {
              legendTable['body'].push([ {
                text: legendData.name,
                style: 'legend',
                color: rgbToHex(legendData.color).toString()
              }, {
                text: legendData.min  ? legendData.min.toString() : '0',
                style: 'legend'
              }, {
                text: legendData.max  ? legendData.max.toString() : '0',
                style: 'legend'
              }, {text: legendData.avg   ? legendData.avg.toString() : '0', style: 'legend'}]);
            }
          })


          docDefinition['content'].push(//{
          //  stack:[

                  {text: metric.alias, style: 'metricheader', headlineLevel : 1, id: metric.legendData.length},
                  {text: metric.summaryText ? metric.summaryText:'', style: 'small'},
                  { image: metric.imageGraph,
                    width: 500,
                    style: 'image'
                  },
                  {
                    style: 'table',
                    table: legendTable,
                    layout: 'noBorders'
                  }
            //    ]
            //}
          )
        })



        var pdfName = $scope.testRunSummary.testRunId + '.pdf'
        pdfMake.createPdf(docDefinition).download(pdfName);

        $scope.showSpinner = false;

      });

    }

    function componentFromStr(numStr, percent) {
      var num = Math.max(0, parseInt(numStr, 10));
      return percent ?
          Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
    }

    function rgbToHex(rgb) {
      var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
      var result, r, g, b, hex = "";
      if ( (result = rgbRegex.exec(rgb)) ) {
        r = componentFromStr(result[1], result[2]);
        g = componentFromStr(result[3], result[4]);
        b = componentFromStr(result[5], result[6]);

        hex = '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }
      return hex;
    }

    function openDeleteModal(size, testRunSummary) {
      ConfirmModal.itemType = 'Delete saved test run summary for ';
      ConfirmModal.selectedItemDescription = testRunSummary.testRunId;
      var modalInstance = $modal.open({
        templateUrl: 'ConfirmDelete.html',
        controller: 'ModalInstanceController',
        size: size  //,
      });
      modalInstance.result.then(function () {
        TestRunSummary.deleteTestRunSummary(testRunSummary).success(function () {

          var toast = $mdToast.simple()
              .action('OK')
              .highlightAction(true)
              .position('top center')
              .hideDelay(6000);

          $mdToast.show(toast.content('Test run summary deleted from db')).then(function(response) {

          });
          /* reload*/
          $state.go($state.current, {}, { reload: true });
        });
      }, function () {
      });
    };

  }
}
