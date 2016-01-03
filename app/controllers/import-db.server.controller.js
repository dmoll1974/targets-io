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
    Template = mongoose.model('Template');

function upload(req, res) {
  console.log(req.files.file.path);
  try {
    eval(fs.readFileSync(req.files.file.path) + '');
  } catch (err) {
    if (err)
      console.log(err);
  }

  /* Remove existing Templates*/

  Template.remove({}, function (err) {
    if (err)
      console.log(err);
    console.log('Template removed');
    if(templates) {
      _.each(templates, function (importTemplate) {

        var templatesDoc = new Template(importTemplate);

        templatesDoc.save(function (err) {
        });

      });
    }
  });

  /* Remove existing Gatling Details*/

  GatlingDetails.remove({}, function (err) {
    if (err)
      console.log(err);
    console.log('GatlingDetails removed');
      if(gatlingDetails) {
        _.each(gatlingDetails, function (importgatlingDetails) {

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
      _.each(events, function (importEvent) {
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
        event.buildResultKey = importEvent.buildResultKey;
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
    _.each(testruns, function (importTestrun) {
      var testrun = new Testrun();

      testrun.start = importTestrun.start;
      testrun.end = importTestrun.end;
      testrun.productName = importTestrun.productName;
      testrun.dashboardName = importTestrun.dashboardName;
      testrun.testRunId = importTestrun.testRunId;
      testrun.buildResultKey = importTestrun.buildResultKey;
      testrun.baseline = importTestrun.baseline;
      testrun.previousBuild = importTestrun.previousBuild;
      testrun.completed = true;
      testrun.meetsRequirement = importTestrun.meetsRequirement;
      testrun.benchmarkResultFixedOK = importTestrun.benchmarkResultFixedOK;
      testrun.benchmarkResultPreviousOK = importTestrun.benchmarkResultPreviousOK;
      testrun.metrics = importTestrun.metrics;


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
        async.forEach(products, function (importProduct, productCallback) {
          var newProduct = new Product();
          newProduct.name = importProduct.name;
          newProduct.description = importProduct.description;
          newProduct.dashboards = importProduct.dashboards;
          newProduct.save(function (err, NewProduct) {
            if (err)
              return console.error(err);
            var importProductDashboards = [];
            _.each(dashboards, function (dashboard) {
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
              newDashboard.baseline = importDashboard.baseline;
              newDashboard.useInBenchmark = importDashboard.useInBenchmark;
              //
              newDashboard.save(function (err, newDashboard) {
                if (err)
                  console.log(err);
                if (newDashboard) {
                  var importDashboardMetrics = [];
                  _.each(metrics, function (metric) {
                    if (_.indexOf(importDashboard.metrics, metric._id) !== -1)
                      importDashboardMetrics.push(metric);
                  });
                  async.forEach(importDashboardMetrics, function (importDashboardMetric, metricCallback) {
                    var newMetric = new Metric();
                    var tags = [];
                    tags.push({ text: importDashboardMetric.tag });
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
function dbImport(req, res) {
  res.render('upload');
}
exports.dbImport = dbImport;
exports.upload = upload;
