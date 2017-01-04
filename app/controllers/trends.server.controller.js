/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    winston = require('winston'),
    errorHandler = require('./errors.server.controller'),
    Testrun = mongoose.model('Testrun'),
    Dashboard = mongoose.model('Dashboard'),
    dashboard = require('./dashboards.server.controller'),
    Product = mongoose.model('Product'),
    _ = require('lodash'),
    Utils = require('./utils.server.controller'),
    Metric = mongoose.model('Metric'),
    async = require('async'),
    config = require('../../config/config'),
    ss = require('simple-statistics');



exports.getData = getData;

function getData(req, res){

  var trends = {};
  trends.metrics = [];
  var targetsArray = [];

  Product.findOne({name: req.params.productName}).exec(function (err, product) {

    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {

      Dashboard.findOne({$and: [{name: req.params.dashboardName}, {productId: product._id}]})
          .populate({path: 'metrics', options: {sort: {tag: 1, alias: 1}}})
          .exec(function (err, dashboard) {
            if (err) {
              return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {

              /* Get all test runs from the specified number of days */
              var startDate = new Date() - 1000 * 60 * 60 * 24 * req.params.startDate;

              Testrun.find({
                $and: [
                  {productName: req.params.productName},
                  {dashboardName: req.params.dashboardName},
                  {completed: true},
                  {end: {$gte: startDate }}
                ]
              }).sort({end: 1 }).exec(function (err, testRuns) {

                if (err) {
                  return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {

                  if(testRuns.length > 0) {

                    if(testRuns.length > 1) {

                      /* Calculate additional data points add to the edges of the graphs */

                      var dateRangeInMs = new Date(testRuns[testRuns.length - 1].end).getTime() - new Date(testRuns[0].end).getTime();
                      var startDate = new Date(new Date(testRuns[0].end).getTime() - (dateRangeInMs / 50));
                      var endDate = new Date(new Date(testRuns[testRuns.length - 1].end).getTime() + (dateRangeInMs / 50));

                    }else{

                      /* Calculate additional data points add to the one data point, one hour before and after */

                      var startDate = new Date(new Date(testRuns[0].end).getTime() - (60 * 60 * 1000));
                      var endDate = new Date(new Date(testRuns[0].end).getTime() + (60 * 60 * 1000));

                    }
                  }

                  /* Get all targets/labels from all test runs */

                  var allMetricLabels = getAllLabelsFromTestRuns(testRuns);


                  _.each(testRuns, function (testRun, i) {

                    _.each(testRun.metrics, function (metric) {

                      var existingMetricIndex = trends.metrics.map(function (metric) {
                        return metric.alias;
                      }).indexOf(metric.alias);

                      var metricIndex = (existingMetricIndex === -1) ? trends.metrics.length : existingMetricIndex;


                      if (existingMetricIndex === -1) {
                        trends.metrics[trends.metrics.length] = {};
                        trends.metrics[metricIndex].alias = metric.alias;
                        trends.metrics[metricIndex].dygraphData = {};
                        trends.metrics[metricIndex].dygraphData.annotations = [];
                        trends.metrics[metricIndex].dygraphData.labels = [];
                        trends.metrics[metricIndex].dygraphData.labels.push("DateTime");
                        trends.metrics[metricIndex].dygraphData.legendData = [];
                        trends.metrics[metricIndex].dygraphData.maxValue = 0;
                        trends.metrics[metricIndex].dygraphData.graphNumberOfValidDatapoints = 0;
                        trends.metrics[metricIndex].dygraphData.data = [];

                        /* add dummy data at start of graph */

                        targetsArray.push(startDate);

                        var metricLabelsIndex = allMetricLabels.metrics.map(function (metric) {
                          return metric.alias;
                        }).indexOf(metric.alias);

                        _.each(allMetricLabels.metrics[metricLabelsIndex].labels, function(label, index){

                          targetsArray.push(null);
                        })

                        trends.metrics[metricIndex].dygraphData.data.push(targetsArray);
                        targetsArray = [];

                      }

                      /* add tags */

                      var tagsIndex = dashboard.metrics.map(function(dashboardMetric){return dashboardMetric.alias;}).indexOf(metric.alias);
                      if(tagsIndex !== -1)trends.metrics[metricIndex].tags = dashboard.metrics[tagsIndex].tags;

                      /* add annotations */


                      trends.metrics[metricIndex].dygraphData.annotations.push({

                        attachAtBottom: true,
                        series: metric.targets[0].target,
                        shortText : i + 1,
                        text: testRun.testRunId,
                        x: new Date(testRun.end).getTime()


                      });


                      targetsArray.push(testRun.end);


                      var metricLabelsIndex = allMetricLabels.metrics.map(function (metric) {
                          return metric.alias;
                        }).indexOf(metric.alias);


                      _.each(allMetricLabels.metrics[metricLabelsIndex].labels, function(label, index){

                         if(trends.metrics[metricIndex].dygraphData.labels.indexOf(label) === -1) trends.metrics[metricIndex].dygraphData.labels.push(label);

                            var targetIndex = metric.targets.map(function(target){return target.target;}).indexOf(label);

                            if(targetIndex === -1){

                              targetsArray.push(null);

                            }else{

                              targetsArray.push(metric.targets[targetIndex].value);
                              trends.metrics[metricIndex].dygraphData.graphNumberOfValidDatapoints += 1;
                            }

                      })


                      trends.metrics[metricIndex].dygraphData.data.push(targetsArray)
                      targetsArray = [];

                      /* add dummy data at end of graph */

                      targetsArray.push(endDate);

                      var metricLabelsIndex = allMetricLabels.metrics.map(function (metric) {
                        return metric.alias;
                      }).indexOf(metric.alias);

                      _.each(allMetricLabels.metrics[metricLabelsIndex].labels, function(label, index){

                        targetsArray.push(null);
                      })

                      trends.metrics[metricIndex].dygraphData.data.push(targetsArray);
                      targetsArray = [];


                    });



                  });



                  /* add legend data */

                  var seriesTotal = {};
                  seriesTotal.value = 0;
                  seriesTotal.numberOfValidDatapoints = 0;

                  var seriesMin;
                  var seriesMax = 0;

                  _.each(trends.metrics, function (metric) {

                    metric.dygraphData.legendData = [];

                    for (var index = 1; index < metric.dygraphData.labels.length; index++) {

                      _.each(metric.dygraphData.data, function (dataItem) {

                        if (dataItem[index]) {

                          seriesMin = (!seriesMin || seriesMin > dataItem[index]) ? dataItem[index] : seriesMin;
                          seriesMax = (seriesMax < dataItem[index]) ? dataItem[index] : seriesMax;
                          seriesTotal = addToTotals(seriesTotal, dataItem[index]);
                        }
                      })

                      metric.dygraphData.legendData.push({
                        id: index,
                        name: metric.dygraphData.labels[index],
                        min: Math.round(seriesMin * 100) / 100,
                        max: Math.round(seriesMax * 100) / 100,
                        avg: Math.round((seriesTotal.value / seriesTotal.numberOfValidDatapoints) * 100) / 100,
                        visible: true,
                        numberOfValidDatapoints: seriesTotal.numberOfValidDatapoints
                      })

                      seriesTotal.value = 0;
                      seriesTotal.numberOfValidDatapoints = 0;
                      seriesMin = null;
                      seriesMax = 0;
                    }

                  });


                  res.jsonp(trends);

                }

              });
            }

        });
    }

  });


  function getAllLabelsFromTestRuns(testRuns){


    var allMetricLabels = {};
    allMetricLabels.metrics = [];

    _.each(testRuns, function (testRun, i) {

      _.each(testRun.metrics, function (metric) {

        var existingMetricIndex = allMetricLabels.metrics.map(function (storedMetric) {
          return storedMetric.alias;
        }).indexOf(metric.alias);

        var metricIndex = (existingMetricIndex === -1) ? allMetricLabels.metrics.length : existingMetricIndex;


        if (existingMetricIndex === -1) {

          allMetricLabels.metrics[allMetricLabels.metrics.length] = {};
          allMetricLabels.metrics[metricIndex].alias = metric.alias;
          allMetricLabels.metrics[metricIndex].labels = [];

        }

        _.each(metric.targets, function (target, index) {


          if (allMetricLabels.metrics[metricIndex].labels.indexOf(target.target) === -1)allMetricLabels.metrics[metricIndex].labels.push(target.target);


        });


        /* sort labels */

        allMetricLabels.metrics[metricIndex].labels.sort();

      });
    });

    return allMetricLabels;
  }

  function  addToTotals(seriesTotal, datapoint){
    var updatedTotal = {};

    if(datapoint !== null) {

      updatedTotal.numberOfValidDatapoints = seriesTotal.numberOfValidDatapoints + 1;
      updatedTotal.value = seriesTotal.value + datapoint;

    }else{

      updatedTotal.numberOfValidDatapoints = seriesTotal.numberOfValidDatapoints;
      updatedTotal.value = seriesTotal.value;

    }

    return updatedTotal;
  }

};
