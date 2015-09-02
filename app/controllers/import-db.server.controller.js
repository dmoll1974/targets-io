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
    Metric = mongoose.model('Metric');

function upload (req, res) {

    console.log(req.files.file.path)

    try {

        eval(fs.readFileSync(req.files.file.path) + '')

    }catch(err){

        if (err) console.log(err)

    };

    /* remove existing collections */

    Event.remove({}, function(err) {
        if (err) console.log(err);
        console.log('Events removed')

        Metric.remove({}, function(err) {
            if (err) console.log(err);
            console.log('Metrics removed')

            Dashboard.remove({}, function(err) {
                if (err) console.log(err);
                console.log('Dashoards removed')
                Product.remove({}, function(err) {
                    if (err) console.log(err);
                    console.log('Products removed')

                    _.each(products, function(importProduct){

                        var newProduct = new Product();

                        newProduct.name = importProduct.name;
                        newProduct.description = importProduct.description;
                        newProduct.dashboards = importProduct.dashboards;

                        newProduct.save(function (err, NewProduct) {
                            if (err) return console.error(err);

                            var importProductDashboards = [];
                            _.each(dashboards, function(dashboard){

                                if (_.indexOf(importProduct.dashboards, dashboard._id)!= -1 )
                                    importProductDashboards.push(dashboard);

                            });

                            _.each(importProductDashboards, function(importDashboard){

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
                                //
                                newDashboard.save(function(err,newDashboard){
                                    if(err) console.log(err);
                                    if(newDashboard){
                                        var importDashboardMetrics = [];
                                        _.each(metrics, function(metric){

                                            if (_.indexOf(importDashboard.metrics, metric._id)!= -1 )
                                                importDashboardMetrics.push(metric);

                                        });

                                        _.each(importDashboardMetrics, function(importDashboardMetric) {

                                            var newMetric = new Metric();
                                            var tags = [];
                                            tags.push({text: importDashboardMetric.tag});
                                            newMetric.dashboardId = newDashboard._id;
                                            newMetric.dashboardName = newDashboard.name;
                                            newMetric.productName = newProduct.name;
                                            newMetric.alias = importDashboardMetric.alias;
                                            newMetric.targets = importDashboardMetric.targets;
                                            newMetric.benchmarkWarning = importDashboardMetric.benchmarkWarning;
                                            newMetric.benchmarkIssue = importDashboardMetric.benchmarkIssue;
                                            newMetric.requirementValue = importDashboardMetric.requirementValue;
                                            newMetric.requirementOperator = importDashboardMetric.requirementOperator;
                                            newMetric.tags = importDashboardMetric.tags;
                                            newMetric.type = importDashboardMetric.type;

                                            newMetric.save(function (err, newMetric) {

                                            });

                                        });
                                    }
                                });

                            });

                        });
                    });


                    _.each(events, function(importEvent){

                        var event = new Event();

                        var splitDashboardName = importEvent.dashboardName.split('-');

                        var eventDesciption;

                        switch(importEvent.eventDescription){

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
                        event.productName = importEvent.productName
                        event.dashboardName = importEvent.dashboardName
                        event.testRunId = importEvent.testRunId;
                        event.eventDescription = eventDesciption;
                        event.baseline = importEvent.baseline;
                        event.buildResultKey = importEvent.buildResultKey;

                        event.save(function (err) {
                        if(err) console.log(err);
                        });

                    });

                });

            });
        });
    });







    /* clean db */


    //setTimeout(function(){
    //
    //
    //    Dashboard.find().exec(function(err, dashboards){
    //
    //        var activeDashboards = [];
    //
    //        _.each(dashboards, function(dashboard){
    //
    //            activeDashboards.push(dashboard._id.toString());
    //        })
    //
    //        Product.find().exec(function(err, products){
    //
    //            var productId;
    //
    //            _.each(products, function(product){
    //
    //                productId = product.toObject()._id.toString();
    //                var updatedDashboards = [];
    //
    //                _.each(product.dashboards, function(dashboardId){
    //
    //                    if(_.indexOf(activeDashboards, dashboardId.toString()) !== -1)updatedDashboards.push(dashboardId)
    //                })
    //
    //                Product.findOne({ _id: productId}, function (err, updateProduct) {
    //
    //                    updateProduct.dashboards = updatedDashboards;
    //                    updateProduct.save(function(err, updateProduct){
    //
    //                    });
    //                })
    //
    //
    //
    //            })
    //        });
    //        res.redirect('/#!');
    //    })
    //
    //}, 30000);





}

function dbImport (req, res) {

    res.render('upload');

}


exports.dbImport = dbImport;
exports.upload = upload;
