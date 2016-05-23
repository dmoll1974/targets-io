'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    fs = require('fs'),
    Event = db.model('Event'),
    Testrun = db.model('Testrun'),
    Dashboard = db.model('Dashboard'),
    Product = db.model('Product'),
    Metric = db.model('Metric'),
    GatlingDetails = db.model('GatlingDetails'),
    Release = db.model('Release'),
    TestrunSummary = db.model('TestrunSummary'),
    Template = db.model('Template');

var wstream = fs.createWriteStream('myOutput.txt');
module.exports.dbExport = function (req, res) {

    res.setHeader('Content-disposition', 'attachment; filename=targets-io.dump');
    res.write('{\n');
    res.write('"products": [');

    Product.find().lean().stream({
            transform: () => {
                let index = 0;
                return (data) => {
                    return (!(index++) ? '' : ',') + JSON.stringify(data);
                };
            }() // invoke
        })

        .on('data', function (product) {

        res.write(product + '\n');
    }).on('close', function () {
        res.write('],\n');
        res.write('"dashboards": [');

        Dashboard.find().lean().stream({
            transform: () => {
                let index = 0;
                return (data) => {
                    return (!(index++) ? '' : ',') + JSON.stringify(data);
                };
            }() // invoke
            })
            .on('data', function (dashboard) {
            res.write(dashboard + '\n');
        }).on('close', function () {
            res.write('],\n');
            res.write('"metrics": [');

            Metric.find().lean().stream({
                transform: () => {
                    let index = 0;
                    return (data) => {
                        return (!(index++) ? '' : ',') + JSON.stringify(data);
                    };
                }() // invoke
                })
                .on('data', function (metric) {
                res.write(metric + '\n');
            }).on('close', function () {
                res.write('],\n');
                res.write('"events": [');

                Event.find().lean().stream({
                    transform: () => {
                        let index = 0;
                        return (data) => {
                            return (!(index++) ? '' : ',') + JSON.stringify(data);
                        };
                    }() // invoke
                })
                    .on('data', function (event) {
                    //event.hookEnabled = false;
                    res.write(event + '\n');
                }).on('close', function () {
                    res.write('],\n');
                    res.write('"testruns": [');
                    Testrun.find().lean().stream({
                        transform: () => {
                            let index = 0;
                            return (data) => {
                                return (!(index++) ? '' : ',') + JSON.stringify(data);
                            };
                        }() // invoke
                      })
                        .on('data', function (testrun) {
                        res.write(testrun + '\n');
                    }).on('close', function () {
                        res.write('],\n');
                        res.write('"templates": [');

                        Template.find().lean().stream({
                            transform: () => {
                                let index = 0;
                                return (data) => {
                                    return (!(index++) ? '' : ',') + JSON.stringify(data);
                                };
                            }() // invoke
                            })
                            .on('data', function (template) {
                            res.write(template + '\n');
                        }).on('close', function () {
                            res.write('],\n');
                            res.write('"releases": [');
                            Release.find().lean().stream({
                                transform: () => {
                                    let index = 0;
                                    return (data) => {
                                        return (!(index++) ? '' : ',') + JSON.stringify(data);
                                    };
                                }() // invoke
                                })
                                .on('data', function (release) {
                                res.write(release + '\n');
                            }).on('close', function () {
                                res.write('],\n');
                                res.write('"testRunSummeries": [');

                                TestrunSummary.find().lean().stream({
                                    transform: () => {
                                        let index = 0;
                                        return (data) => {
                                            return (!(index++) ? '' : ',') + JSON.stringify(data);
                                        };
                                    }() // invoke
                                    })
                                    .on('data', function (testrunSummary) {
                                    res.write(testrunSummary + '\n');
                                }).on('close', function () {
                                    res.write('],\n');
                                    res.write('"gatlingDetails": [');

                                    GatlingDetails.find()
                                        .lean()
                                        .stream({
                                            transform: () => {
                                                let index = 0;
                                                return (data) => {
                                                    return (!(index++) ? '' : ',') + JSON.stringify(data);
                                                };
                                            }() // invoke
                                         })
                                        .on('data', function (gatlingDetails) {
                                            res.write(gatlingDetails + '\n');
                                        })
                                        .on('close', function () {
                                            res.write(']\n}');
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
