//'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    fs = require('fs'),
    Event = mongoose.model('Event'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    Metric = mongoose.model('Metric'),
    Testrun = mongoose.model('Testrun'),
    GatlingDetails = mongoose.model('GatlingDetails'),
    async = require('async'),
    Template = mongoose.model('Template'),
    Release = mongoose.model('Release'),
    TestrunSummary = mongoose.model('TestrunSummary'),
    RunningTest = mongoose.model('RunningTest'),
    testRunsModule = require('./testruns.server.controller'),
    jsonfile = require('jsonfile');


function upload(req, res) {
  console.log(req.files.file.path);

  var file = req.files.file.path;
  jsonfile.readFile(file, function(err, importItems) {

    if(err){
      console.log(err);
    }else {

      /* Remove existing Templates and import from file*/

      Template.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('Template removed');
        if (importItems.templates) {
          _.each(importItems.templates, function (importTemplate) {

            var templatesDoc = new Template(importTemplate);

            _.each(templatesDoc.metrics, function (metric) {

              var responseTimePattern = new RegExp("Response Times|Time");
              if (responseTimePattern.test(metric.alias)) metric.unit = 'Milliseconds';

              var heapInUsePattern = new RegExp("Mb");
              if (heapInUsePattern.test(metric.alias)) metric.unit = 'Mb';

              var transactionsPattern = new RegExp("Transactions|transactions");
              if (transactionsPattern.test(metric.alias)) metric.unit = 'Transactions';

              var countPattern = new RegExp("Count|count|numActive|ThreadsBusy");
              if (countPattern.test(metric.alias)) metric.unit = 'Count';

              var percentagePattern = new RegExp("Percentage|percentage|CPU per host");
              if (percentagePattern.test(metric.alias)) metric.unit = 'Percentage';

              var bytesSecondPattern = new RegExp("bytes\/second");
              if (bytesSecondPattern.test(metric.alias)) metric.unit = 'Bytes/second';

              var responsesPattern = new RegExp("Responses|responses");
              if (responsesPattern.test(metric.alias)) metric.unit = 'Responses';


              var errorsPattern = new RegExp("Errors|errors");
              if (errorsPattern.test(metric.alias)) metric.unit = 'Errors';

              var usersPattern = new RegExp("Users|users");
              if (usersPattern.test(metric.alias)) metric.unit = 'Users';

              var cpusecPattern = new RegExp("CPU process|CPUSec");
              if (cpusecPattern.test(metric.alias)) metric.unit = 'CPUSec';

            })


            templatesDoc.save(function (err) {
            });

          });
        }
      });

      /* Remove existing TestrunSummary and import from file */

      TestrunSummary.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('TestrunSummaries removed');
        if (importItems.testrunSummaries) {
          _.each(importItems.testrunSummaries, function (importTestrunSummary) {

            var testrunSummaryDoc = new TestrunSummary(importTestrunSummary);

            _.each(testrunSummaryDoc.metrics, function (metric) {

              var responseTimePattern = new RegExp("Response Times|Time");
              if (responseTimePattern.test(metric.alias)) metric.unit = 'Milliseconds';

              var heapInUsePattern = new RegExp("Mb");
              if (heapInUsePattern.test(metric.alias)) metric.unit = 'Mb';

              var transactionsPattern = new RegExp("Transactions|transactions");
              if (transactionsPattern.test(metric.alias)) metric.unit = 'Transactions';

              var countPattern = new RegExp("Count|count|numActive|ThreadsBusy");
              if (countPattern.test(metric.alias)) metric.unit = 'Count';

              var percentagePattern = new RegExp("Percentage|percentage|CPU per host");
              if (percentagePattern.test(metric.alias)) metric.unit = 'Percentage';

              var bytesSecondPattern = new RegExp("bytes\/second");
              if (bytesSecondPattern.test(metric.alias)) metric.unit = 'Bytes/second';

              var responsesPattern = new RegExp("Responses|responses");
              if (responsesPattern.test(metric.alias)) metric.unit = 'Responses';


              var errorsPattern = new RegExp("Errors|errors");
              if (errorsPattern.test(metric.alias)) metric.unit = 'Errors';

              var usersPattern = new RegExp("Users|users");
              if (usersPattern.test(metric.alias)) metric.unit = 'Users';

              var cpusecPattern = new RegExp("CPU process|CPUSec");
              if (cpusecPattern.test(metric.alias)) metric.unit = 'CPUSec';

            })
            testrunSummaryDoc.save(function (err) {
            });

          });
        }
      });

      /* Remove existing Releases and import from file */

      Release.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('Releases removed');

        /* Drop indeces */
        //Release.collection.dropAllIndexes(function (err, results) {

        if (importItems.releases) {
          _.each(importItems.releases, function (importRelease) {

            var releaseDoc = new Release(importRelease);

            releaseDoc.save(function (err) {
            });

          });
        }
        //});
      });
      
      /* Remove existing runningTests and import from file */

      RunningTest.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('RunningTests removed');


        if (importItems.runningTests) {
          _.each(importItems.runningTests, function (importRunningTest) {

            var runningTestDoc = new RunningTest(importRunningTest);

            runningTestDoc.save(function (err) {
            });

          });
        }
        //});
      });

      /* Remove existing Gatling Details*/

      GatlingDetails.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('GatlingDetails removed');
        if (importItems.gatlingDetails) {
          _.each(importItems.gatlingDetails, function (importgatlingDetails) {

            var gatlingDetailsDoc = new GatlingDetails();

            gatlingDetailsDoc.consoleUrl = importgatlingDetails.consoleUrl;
            gatlingDetailsDoc.response = importgatlingDetails.response;

            gatlingDetailsDoc.save(function (err) {
            });

          });
        }
      });
      /* remove existing collections */
      Event.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('Events removed');
        _.each(importItems.events, function (importEvent) {
          var event = new Event();
          var splitDashboardName = importEvent.dashboardName.split('-');
          var eventDesciption;
          switch (importEvent.eventDescription) {
            case 'Start-loadtest':
              eventDesciption = 'start';
              break;
            case 'End-loadtest':
              eventDesciption = 'end';
              break;
            default:
              eventDesciption = importEvent.eventDescription;
          }
          event.eventTimestamp = importEvent.eventTimestamp;
          event.productName = importEvent.productName;
          event.dashboardName = importEvent.dashboardName;
          event.testRunId = importEvent.testRunId;
          event.eventDescription = eventDesciption;
          event.buildResultsUrl = importEvent.buildResultsUrl;
          event.hookEnabled = importEvent.hookEnabled;

          event.save(function (err) {
            if (err)
              console.log(err);
          });
        });
      });

      Testrun.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('Testruns removed');
        _.each(importItems.testruns, function (importTestrun) {
          var testrun = new Testrun();

          testrun.start = importTestrun.start;
          testrun.end = importTestrun.end;
          testrun.productName = importTestrun.productName;
          testrun.dashboardName = importTestrun.dashboardName;
          testrun.testRunId = importTestrun.testRunId;
          testrun.buildResultsUrl = importTestrun.buildResultsUrl;
          testrun.baseline = importTestrun.baseline;
          testrun.previousBuild = importTestrun.previousBuild;
          testrun.completed = importTestrun.completed;
          testrun.productRelease = importTestrun.productRelease;
          testrun.rampUpPeriod = importTestrun.rampUpPeriod;
          testrun.annotations = importTestrun.annotations;
          testrun.meetsRequirement = importTestrun.meetsRequirement;
          testrun.benchmarkResultFixedOK = importTestrun.benchmarkResultFixedOK;
          testrun.benchmarkResultPreviousOK = importTestrun.benchmarkResultPreviousOK;
          testrun.metrics = importTestrun.metrics;
          testrun.humanReadableDuration = testRunsModule.humanReadbleDuration(new Date(importTestrun.end).getTime() - new Date(importTestrun.start).getTime());


          testrun.save(function (err) {
            if (err)
              console.log(err);
          });
        });
      });

      Metric.remove({}, function (err) {
        if (err)
          console.log(err);
        console.log('Metrics removed');
        Dashboard.remove({}, function (err) {
          if (err)
            console.log(err);
          console.log('Dashoards removed');
          Product.remove({}, function (err) {
            if (err)
              console.log(err);
            console.log('Products removed');
            async.forEach(importItems.products, function (importProduct, productCallback) {
              var newProduct = new Product();
              newProduct.name = importProduct.name;
              newProduct.description = importProduct.description;
              newProduct.dashboards = importProduct.dashboards;
              newProduct.requirements = importProduct.requirements;

              newProduct.save(function (err, NewProduct) {
                if (err)
                  return console.error(err);
                var importProductDashboards = [];
                _.each(importItems.dashboards, function (dashboard) {
                  if (_.indexOf(importProduct.dashboards, dashboard._id) !== -1)
                    importProductDashboards.push(dashboard);
                });
                async.forEach(importProductDashboards, function (importDashboard, dashboardCallback) {
                  var newDashboard = new Dashboard();
                  //var dashboardName = importDashboard.name.split('-');
                  newDashboard.productId = newProduct._id;
                  newDashboard.name = importDashboard.name;
                  newDashboard.description = importDashboard.description;
                  newDashboard.metrics = importDashboard.metrics;
                  newDashboard.granularity = importDashboard.granularity;
                  newDashboard.metricsRegexWily = importDashboard.metricsRegexWily;
                  newDashboard.hosts = importDashboard.hosts;
                  newDashboard.applications = importDashboard.applications;
                  newDashboard.instances = importDashboard.instances;
                  newDashboard.tags = importDashboard.tags;
                  newDashboard.goal = importDashboard.goal;
                  newDashboard.includeRampUp = importDashboard.includeRampUp;
                  newDashboard.startSteadyState = importDashboard.startSteadyState;
                  newDashboard.baseline = importDashboard.baseline;
                  newDashboard.useInBenchmark = importDashboard.useInBenchmark;
                  //
                  newDashboard.save(function (err, newDashboard) {
                    if (err)
                      console.log(err);
                    if (newDashboard) {
                      var importDashboardMetrics = [];
                      _.each(importItems.metrics, function (metric) {
                        if (_.indexOf(importDashboard.metrics, metric._id) !== -1)
                          importDashboardMetrics.push(metric);
                      });
                      async.forEach(importDashboardMetrics, function (importDashboardMetric, metricCallback) {
                        var newMetric = new Metric();
                        var tags = [];
                        tags.push({text: importDashboardMetric.tag});
                        newMetric._id = importDashboardMetric._id;
                        newMetric.dashboardId = newDashboard._id;
                        newMetric.dashboardName = newDashboard.name;
                        newMetric.productName = newProduct.name;
                        newMetric.alias = importDashboardMetric.alias;
                        newMetric.targets = importDashboardMetric.targets;
                        newMetric.benchmarkOperator = importDashboardMetric.benchmarkOperator;
                        newMetric.benchmarkValue = importDashboardMetric.benchmarkValue;
                        newMetric.requirementValue = importDashboardMetric.requirementValue;
                        newMetric.requirementOperator = importDashboardMetric.requirementOperator;
                        newMetric.tags = importDashboardMetric.tags;
                        newMetric.type = importDashboardMetric.type;
                        newMetric.includeInSummary = importDashboardMetric.includeInSummary;
                        newMetric.defaultSummaryText = importDashboardMetric.defaultSummaryText;
                        newMetric.summaryIndex = importDashboardMetric.summaryIndex;

                        var responseTimePattern = new RegExp("Response Times|Time");
                        if (responseTimePattern.test(newMetric.alias)) newMetric.unit = 'Milliseconds';

                        var heapInUsePattern = new RegExp("Mb");
                        if (heapInUsePattern.test(newMetric.alias)) newMetric.unit = 'Mb';

                        var transactionsPattern = new RegExp("Transactions|transactions");
                        if (transactionsPattern.test(newMetric.alias)) newMetric.unit = 'Transactions';

                        var countPattern = new RegExp("Count|count|numActive|ThreadsBusy");
                        if (countPattern.test(newMetric.alias)) newMetric.unit = 'Count';

                        var percentagePattern = new RegExp("Percentage|percentage|CPU per host");
                        if (percentagePattern.test(newMetric.alias)) newMetric.unit = 'Percentage';

                        var bytesSecondPattern = new RegExp("bytes\/second");
                        if (bytesSecondPattern.test(newMetric.alias)) newMetric.unit = 'Bytes/second';

                        var responsesPattern = new RegExp("Responses|responses");
                        if (responsesPattern.test(newMetric.alias)) newMetric.unit = 'Responses';


                        var errorsPattern = new RegExp("Errors|errors");
                        if (errorsPattern.test(newMetric.alias)) newMetric.unit = 'Errors';

                        var usersPattern = new RegExp("Users|users");
                        if (usersPattern.test(newMetric.alias)) newMetric.unit = 'Users';

                        var cpusecPattern = new RegExp("CPU process|CPUSec");
                        if (cpusecPattern.test(newMetric.alias)) newMetric.unit = 'CPUSec';


                        newMetric.save(function (err, newMetric) {
                          //console.log('Saved metric #'+ m);
                          metricCallback();
                        });
                      }, function (err) {
                        dashboardCallback();
                      });
                    }
                  });
                }, function (err) {
                  productCallback();
                });
              });
            }, function (err) {
              console.log('import done!');
              res.sendStatus(200);
            });
          });
        });
      });

    }
  });

  }
function dbImport(req, res) {
  res.render('upload');
}
exports.dbImport = dbImport;
exports.upload = upload;
