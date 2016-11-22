'use strict';
//Dashboards service used to communicate Dashboards REST endpoints
angular.module('core').factory('ExportToPdf', [
  '$http', 'Events',
  function ($http, Events) {
    var ExportToPdf = {
      //            items : [],
      'testRunSummaryToPdf': testRunSummaryToPdf

    };
    return ExportToPdf;

    function testRunSummaryToPdf(testRunSummary, callback) {

      /* get events first */

      Events.listEventsForTestRunId(testRunSummary.productName, testRunSummary.dashboardName, testRunSummary.testRunId).success(function(events) {


        var docDefinition = {};

        docDefinition['content'] = [];

        docDefinition['pageBreakBefore'] =
            function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
              if (currentNode.headlineLevel === 1 && currentNode.id) {
                return currentNode.headlineLevel === 1 && followingNodesOnPage.length < 3 + (parseInt(currentNode.id) + 1) * 3; //Hack to deal with dynamic size of legend
              } else {
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
        testRunInfoTable['body'].push([{text: 'Product', style: 'bold'}, testRunSummary.productName]);
        testRunInfoTable['body'].push([{text: 'Release', style: 'bold'}, testRunSummary.productRelease]);
        testRunInfoTable['body'].push([{text: 'Dashboard', style: 'bold'}, testRunSummary.dashboardName]);
        testRunInfoTable['body'].push([{text: 'Description', style: 'bold'}, testRunSummary.description]);
        if (testRunSummary.goal) {
          testRunInfoTable['body'].push([{text: 'Goal', style: 'bold'}, testRunSummary.goal]);
        }
        testRunInfoTable['body'].push([{text: 'Test run ID', style: 'bold'}, testRunSummary.testRunId]);
        testRunInfoTable['body'].push([{
          text: 'Period',
          style: 'bold'
        }, new Date(testRunSummary.start).toISOString().split('.')[0].replace('T', ' ') + ' - ' + new Date(testRunSummary.end).toISOString().split('.')[0].replace('T', ' ')]);
        testRunInfoTable['body'].push([{text: 'Duration', style: 'bold'}, testRunSummary.humanReadableDuration]);
        if (testRunSummary.annotations && testRunSummary.annotations !== 'None') {
          testRunInfoTable['body'].push([{text: 'Annotations', style: 'bold'}, testRunSummary.annotations]);
        }


        stack.push({
          style: 'table',
          table: testRunInfoTable,
          layout: 'noBorders'
        });

        /* Markdown */

        if (testRunSummary.markDown) {

          _.each(splitAndStyleMarkdown(testRunSummary.markDown), function (markDownLine) {

            stack.push({text: markDownLine.text, style: markDownLine.style});

          })

        }

        function splitAndStyleMarkdown(markDown) {

          var splitAndStyledMarkDownLines = [];

          var markDownLines = markDown.split('\n');

          var subheaderRegex = new RegExp('####.*');

          _.each(markDownLines, function (markDownLine) {

            /* remove all markdown characters except for headers */

            markDownLine = markDownLine.replace(/\*/g, '').replace(/\>/g, '').replace(/\`/g, '');

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

        if (testRunSummary.requirements.length > 0) {

          var requirementsTable = {};
          requirementsTable['body'] = [];
          requirementsTable['body'].push([{text: 'Requirement', style: 'tableHeader'}, {
            text: 'Result',
            style: 'tableHeader'
          }]);

          _.each(testRunSummary.requirements, function (requirement) {

            requirementsTable['body'].push([{text: requirement.requirementText}, {
              text: (requirement.meetsRequirement) ? 'OK' : 'NOK',
              style: 'smallNoMargin'
            }]);

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

            eventsTable['body'].push([{
              text: (i + 1).toString(),
              style: 'smallNoMargin'
            }, {
              text: new Date(event.eventTimestamp).toISOString().split('.')[0].replace('T', ' '),
              style: 'smallNoMargin'
            }, {text: event.eventDescription, style: 'smallNoMargin'}]);

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


        _.each(testRunSummary.metrics, function (metric) {

          var legendTable = {};
          legendTable['body'] = [];
          legendTable['body'].push([{text: 'Metric', style: 'legendHeader'}, {
            text: 'Min',
            style: 'legendHeader'
          }, {text: 'Max', style: 'legendHeader'}, {text: 'Avg', style: 'legendHeader'}]);

          _.each(metric.legendData, function (legendData) {

            if ((legendData.min || legendData.min === 0) && legendData.avg !== null) {
              legendTable['body'].push([{
                text: legendData.name,
                style: 'legend',
                color: rgbToHex(legendData.color).toString()
              }, {
                text: legendData.min ? legendData.min.toString() : '0',
                style: 'legend'
              }, {
                text: legendData.max ? legendData.max.toString() : '0',
                style: 'legend'
              }, {text: legendData.avg ? legendData.avg.toString() : '0', style: 'legend'}]);
            }
          })


          docDefinition['content'].push(//{
              //  stack:[

              {text: metric.alias, style: 'metricheader', headlineLevel: 1, id: metric.legendData.length},
              {text: metric.summaryText ? metric.summaryText : '', style: 'small'},
              {
                image: metric.imageGraph,
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


        callback(docDefinition);

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
  }
]);
