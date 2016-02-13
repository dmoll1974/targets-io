//'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    fs = require('fs'),
    Event = mongoose.model('Event'),
    Testrun = mongoose.model('Testrun'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    Metric = mongoose.model('Metric'),
    GatlingDetails = mongoose.model('GatlingDetails'),
    Release = mongoose.model('Release'),
    TestrunSummary = mongoose.model('TestrunSummary'),
    Template = mongoose.model('Template');

var wstream = fs.createWriteStream('myOutput.txt');
module.exports.dbExport = function (req, res) {
    var started = false;

    function start(response) {
        response.setHeader('Content-disposition', 'attachment; filename=targets-io.dump');
        response.write('var products = [\n');
        started = true;
    }

    Product.find().lean().stream().on('data', function (product) {
        if (!started) {
            start(res);
        }
        res.write(JSON.stringify(product) + ',\n');
    }).on('close', function () {
        res.write('];\n\n');
        res.write('var dashboards = [\n');
        Dashboard.find().lean().stream().on('data', function (dashboard) {
            if (!started) {
                start(res);
            }
            res.write(JSON.stringify(dashboard) + ',\n');
        }).on('close', function () {
            res.write('];\n\n');
            res.write('var metrics = [\n');
            Metric.find().lean().stream().on('data', function (metric) {
                if (!started) {
                    start(res);
                }
                res.write(JSON.stringify(metric) + ',');
            }).on('close', function () {
                res.write('];\n\n');
                res.write('var events = [\n');
                Event.find().lean().stream().on('data', function (event) {
                    if (!started) {
                        start(res);
                    }
                    event.hookEnabled = false;
                    res.write(JSON.stringify(event) + ',');
                }).on('close', function () {
                    res.write('];\n\n');
                    res.write('var testruns = [\n');
                    Testrun.find().lean().stream().on('data', function (testrun) {
                        if (!started) {
                            start(res);
                        }
                        res.write(JSON.stringify(testrun) + ',');
                    }).on('close', function () {
                        res.write('];\n\n');
                        res.write('var templates = [\n');
                        Template.find().lean().stream().on('data', function (testrun) {
                            if (!started) {
                                start(res);
                            }
                            res.write(JSON.stringify(testrun) + ',');
                        }).on('close', function () {
                            res.write('];\n\n');
                            res.write('var releases = [\n');
                            Release.find().lean().stream().on('data', function (testrun) {
                                if (!started) {
                                    start(res);
                                }
                                res.write(JSON.stringify(testrun) + ',');
                            }).on('close', function () {
                                res.write('];\n\n');
                                res.write('var testrunSummaries = [\n');
                                TestrunSummary.find().lean().stream().on('data', function (testrun) {
                                    if (!started) {
                                        start(res);
                                    }
                                    res.write(JSON.stringify(testrun) + ',');
                                }).on('close', function () {
                                    res.write('];\n\n')
                                    res.write('var gatlingDetails = [\n')
                                    GatlingDetails.find()
                                    .lean()
                                    .stream()
                                    .on('data', function (gatlingDetails) {
                                        if (!started) {
                                            start(res);
                                        }
                                        res.write(JSON.stringify(gatlingDetails) + ',');
                                    })
                                    .on('close', function () {
                                        res.write('];');
                                        res.write('exports.importProducts = products;');
                                        res.write('exports.importDashboards = dashboards;');
                                        res.write('exports.importMetrics = metrics;');
                                        res.write('exports.importEvents = events;');
                                        res.write('exports.importTestruns = testruns;');
                                        res.write('exports.importTemplates = templates;');
                                        res.write('exports.importTestrunSummaries = testrunSummaries;');
                                        res.write('exports.importReleases = releases;');
                                        res.write('exports.importGatlingDetails = gatlingDetails;');
                                        res.end();
                                    }).on('error', function (err) {
                                        res.send(500, {
                                            err: err,
                                            msg: 'Failed to get gatlingDetails from db'
                                        });
                                    });
                                }).on('error', function (err) {
                                    res.send(500, {err: err,
                                        msg: 'Failed to get testrunSummaries from db'
                                    });
                                });
                            }).on('error', function (err) {
                                res.send(500, {err: err,
                                    msg: 'Failed to get releases from db'
                                });
                            });
                        }).on('error', function (err) {
                            res.send(500, {err: err,
                                msg: 'Failed to get templates from db'
                            });
                        });
                    }).on('error', function (err) {
                        res.send(500, {err: err,
                            msg: 'Failed to get test runs from db'
                        });
                    });
                }).on('error', function (err) {
                    res.send(500, {err: err,
                        msg: 'Failed to get events from db'
                    });
                });
            }).on('error', function (err) {
                res.send(500, {
                    err: err,
                    msg: 'Failed to get metrics from db'
                });
            });
        }).on('error', function (err) {
            res.send(500, {
                err: err,
                msg: 'Failed to get dashboards from db'
            });
        });
    }).on('error', function (err) {
        res.send(500, {
            err: err,
            msg: 'Failed to get products from db'
        });
    });
};
