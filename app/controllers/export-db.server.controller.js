'use strict';
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
    RunningTest = mongoose.model('RunningTest'),
    Template = mongoose.model('Template');

var wstream = fs.createWriteStream('myOutput.txt');

exports.dbExport = dbExport;
exports.dbExportForProduct = dbExportForProduct;

function dbExportForProduct (req, res) {

    var fileName = 'targets-io-' + req.params.product + '.json';
    var dashboardIds = [];
    var dashboardNames = [];
    var exportProduct;


    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.write('{\n');
    res.write('"products": [');

    Product.find({name: req.params.product }).lean().stream({
        transform: () => {
            let index = 0;
            return (data) => {
                return (!(index++) ? '' : ',') + JSON.stringify(data);
            };
        }() // invoke
        })

        .on('data', function (product) {

                res.write(product + '\n');
                exportProduct = JSON.parse(product);

            }).on('close', function () {
                res.write('],\n');
                res.write('"dashboards": [');

                Dashboard.find({productId: exportProduct._id}).lean().stream({
                    transform: () => {
                        let index = 0;
                        return (data) => {
                            return (!(index++) ? '' : ',') + JSON.stringify(data);
                        };
                    }() // invoke
                })
                .on('data', function (dashboard) {
                    res.write(dashboard + '\n');
                    dashboardIds.push(dashboard[0]===','? JSON.parse(dashboard.slice(1))._id : JSON.parse(dashboard)._id);
                    dashboardNames.push(dashboard[0]===','? JSON.parse(dashboard.slice(1)).name : JSON.parse(dashboard).name);
                }).on('close', function () {
                    res.write('],\n');
                    res.write('"metrics": [');

                    Metric.find( {dashboardId: { $in: dashboardIds}}).lean().stream({
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

                        Event.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]}).lean().stream({
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
                            Testrun.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]}).lean().stream({
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
                                    res.write('"releases": [');

                                    Release.find({name: req.params.product}).lean().stream({
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
                                        res.write('"testrunSummaries": [');

                                        TestrunSummary.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]}).lean().stream({
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

                                            GatlingDetails.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]})
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
                                            })
                                            .on('error', function (err) {
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

function dbExport (req, res) {

    res.setHeader('Content-disposition', 'attachment; filename=targets-io.json');
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
                                res.write('"testrunSummaries": [');

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
                                    res.write('"runningTests": [');
                                    RunningTest.find().lean().stream({
                                        transform: () => {
                                            let index = 0;
                                            return (data) => {
                                                return (!(index++) ? '' : ',') + JSON.stringify(data);
                                            };
                                        }() // invoke
                                        })
                                    .on('data', function (runningTest) {
                                    res.write(runningTest + '\n');
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
                                                msg: 'Failed to get runningTests from db'
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
