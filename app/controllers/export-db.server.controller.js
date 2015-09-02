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


var wstream = fs.createWriteStream('myOutput.txt');


module.exports.dbExport = function (req, res) {

    var started = false;

    function start(response) {
        response.setHeader('Content-disposition', 'attachment; filename=lt-dash.dump');
        response.write('var products = [\n')
        started = true;
    }

    Product.find()
        .lean()
        .stream()
        .on('data', function (product) {
            if (!started) {
                start(res);
            }
            res.write(JSON.stringify(product) + ',\n');
        })
        .on('close', function () {
            res.write('];\n\n')
            res.write('var dashboards = [\n')

            Dashboard.find()
                .lean()
                .stream()
                .on('data', function (dashboard) {
                    if (!started) {
                        start(res);
                    }
                    res.write(JSON.stringify(dashboard) + ',\n');
                })
                .on('close', function () {
                    res.write('];\n\n')
                    res.write('var metrics = [\n')

                    Metric.find()
                        .lean()
                        .stream()
                        .on('data', function (metric) {
                            if (!started) {
                                start(res);
                            }
                            res.write(JSON.stringify(metric) + ',');
                        })
                        .on('close', function () {
                            res.write('];\n\n');
                            res.write('var events = [\n');

                            Event.find()
                                .lean()
                                .stream()
                                .on('data', function (event) {
                                    if (!started) {
                                        start(res);
                                    }
                                    res.write(JSON.stringify(event) + ',');
                                })
                                .on('close', function () {
                                    //res.write('];\n\n')
                                    //res.write('var gatlingDetails = [\n')
                                    //
                                    //GatlingDetails.find()
                                    //    .lean()
                                    //    .stream()
                                    //    .on('data', function (gatlingDetails) {
                                    //        if (!started) {
                                    //            start(res);
                                    //        }
                                    //        res.write(JSON.stringify(gatlingDetails) + ',');
                                    //    })
                                    //    .on('close', function () {
                                            res.write('];');
                                            res.write('exports.importProducts = products;');
                                            res.write('exports.importDashboards = dashboards;');
                                            res.write('exports.importMetrics = metrics;');
                                            res.write('exports.importEvents = events;');
                                            res.write('exports.importGatlingDetails = gatlingDetails;');
                                            res.end();
                                        })
                                        .on('error', function (err) {
                                            res.send(500, {err: err, msg: "Failed to get events from db"});
                                        });
                                //})
                                //.on('error', function (err) {
                                //    res.send(500, {err: err, msg: "Failed to get gatlingDetails from db"});
                                //});


                        })
                        .on('error', function (err) {
                            res.send(500, {err: err, msg: "Failed to get metrics from db"});
                        });

                })
                .on('error', function (err) {
                    res.send(500, {err: err, msg: "Failed to get dashboards from db"});
                });

        })
        .on('error', function (err) {
            res.send(500, {err: err, msg: "Failed to get products from db"});
        });

}



