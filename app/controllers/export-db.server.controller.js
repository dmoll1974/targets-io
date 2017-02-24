'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    winston = require('winston'),
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
exports.dbExportTemplate = dbExportTemplate;

function dbExportTemplate(req, res){

    let templateIndex = 0;

    var fileName = 'targets-io-template-' + req.params.templateName + '.json';

    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.write('{\n');
    res.write('"templates": [');

    const templateCursor = Template.find({name: req.params.templateName}).lean().cursor()

    templateCursor.eachAsync(function(data){

        templateIndex++;

            if(templateIndex === 1){

                res.write(JSON.stringify(data) + '\n');

            }else{

                res.write(', ' + JSON.stringify(data) + '\n');

            }

        })
    .then(function () {
        res.write(']\n}');
        res.end();
    })

}

function dbExportForProduct (req, res) {

    var fileName = 'targets-io-' + req.params.product + '.json';
    var dashboardIds = [];
    var dashboardNames = [];
    var exportProduct;


    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.write('{\n');
    res.write('"products": [');

    let productIndex = 0;
    let dashboardIndex = 0;
    let metricIndex = 0;
    let eventIndex = 0;
    let testRunIndex = 0;
    let testRunSummaryIndex = 0;
    let releaseIndex = 0;
    let gatlingDetailsIndex = 0;

    const productCursor = Product.find({name: req.params.product }).lean().cursor()

    productCursor.eachAsync(function(data){

        productIndex++;

        if(productIndex === 1){

            console.log('productIndex: ' + productIndex);

            res.write(JSON.stringify(data) + '\n');

        }else{

            console.log('productIndex: ' + productIndex);

            res.write(', ' + JSON.stringify(data) + '\n');

        }

        exportProduct = JSON.parse(JSON.stringify(data));

    })
    .then(function() {

        res.write('],\n');
        res.write('"dashboards": [');

        const dashboardCursor = Dashboard.find({productId: exportProduct._id}).lean().cursor()

        dashboardCursor.eachAsync(function (data) {

                dashboardIndex++;

                if (dashboardIndex === 1) {

                    console.log('dashboardIndex: ' + dashboardIndex);

                    res.write(JSON.stringify(data) + '\n');

                } else {

                    console.log('dashboardIndex: ' + dashboardIndex);

                    res.write(', ' + JSON.stringify(data) + '\n');

                }

                dashboardIds.push(JSON.stringify(data)[0]===','? JSON.parse(JSON.stringify(data).slice(1))._id : JSON.parse(JSON.stringify(data))._id);
                dashboardNames.push(JSON.stringify(data)[0]===','? JSON.parse(JSON.stringify(data).slice(1)).name : JSON.parse(JSON.stringify(data)).name);
        })
        .then(function () {

            res.write('],\n');
            res.write('"metrics": [');

            const metricCursor = Metric.find( {dashboardId: { $in: dashboardIds}}).lean().cursor();

            metricCursor.eachAsync(function (data) {

                    metricIndex++;

                    if (metricIndex === 1) {

                        console.log('metricIndex: ' + metricIndex);

                        res.write(JSON.stringify(data) + '\n');

                    } else {

                        console.log('metricIndex: ' + metricIndex);

                        res.write(', ' + JSON.stringify(data) + '\n');

                    }


            })
            .then(function () {

                res.write('],\n');
                res.write('"events": [');

                const eventCursor = Event.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]}).lean().cursor()

                eventCursor.eachAsync(function (data) {

                        eventIndex++;

                        if (eventIndex === 1) {

                            res.write(JSON.stringify(data) + '\n');

                        } else {

                            res.write(', ' + JSON.stringify(data) + '\n');

                        }


                })
                .then(function () {

                    res.write('],\n');
                    res.write('"testruns": [');

                    const testRunCursor = Testrun.find({$and:[{productName: req.params.product}, {dashboardName:{ $in: dashboardNames}}]}).lean().cursor();

                    testRunCursor.eachAsync(function (data) {

                            testRunIndex++;

                            if (testRunIndex === 1) {

                                res.write(JSON.stringify(data) + '\n');

                            } else {

                                res.write(', ' + JSON.stringify(data) + '\n');

                            }


                    })
                    .then(function () {

                        res.write('],\n');
                        res.write('"releases": [');

                        const releaseCursor = Release.find({name: req.params.product}).lean().cursor();

                        releaseCursor.eachAsync(function (data) {

                                releaseIndex++;

                                if (releaseIndex === 1) {

                                    res.write(JSON.stringify(data) + '\n');

                                } else {

                                    res.write(', ' + JSON.stringify(data) + '\n');

                                }


                        })
                        .then(function () {

                            res.write('],\n');
                            res.write('"testrunSummaries": [');

                            const testRunSummaryCursor = TestrunSummary.find({$and: [{productName: req.params.product}, {dashboardName: {$in: dashboardNames}}]}).lean().cursor();

                            testRunSummaryCursor.eachAsync(function (data) {

                                    testRunSummaryIndex++;

                                    if (testRunSummaryIndex === 1) {

                                        res.write(JSON.stringify(data) + '\n');

                                    } else {

                                        res.write(', ' + JSON.stringify(data) + '\n');

                                    }


                                })
                                .then(function () {

                                    res.write('],\n');
                                    res.write('"gatlingDetails": [');

                                    const gatlingDetailsCursor = GatlingDetails.find({$and: [{productName: req.params.product}, {dashboardName: {$in: dashboardNames}}]}).lean().cursor();

                                    gatlingDetailsCursor.eachAsync(function (data) {

                                            gatlingDetailsIndex++;

                                            if (gatlingDetailsIndex === 1) {

                                                res.write(JSON.stringify(data) + '\n');

                                            } else {

                                                res.write(', ' + JSON.stringify(data) + '\n');

                                            }


                                        })
                                        .then(function () {

                                            res.write(']\n');
                                            res.write('}');
                                            res.end();

                                        })
                                })
                            })
                        })
                    })
                })
            })
        })

};

function dbExport (req, res) {

    var fileName = 'targets-io-' + new Date().toISOString().slice(0, 10) + '.json';

    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.write('{\n');
    res.write('"products": [');


    let productIndex = 0;
    let dashboardIndex = 0;
    let metricIndex = 0;
    let eventIndex = 0;
    let testRunIndex = 0;
    let testRunSummaryIndex = 0;
    let releaseIndex = 0;
    let gatlingDetailsIndex = 0;
    let templateIndex = 0;
    let runningTestIndex = 0;

    const productCursor = Product.find().lean().cursor()

    productCursor.eachAsync(function(data){

            productIndex++;

            if(productIndex === 1){

                console.log('productIndex: ' + productIndex);

                res.write(JSON.stringify(data) + '\n');

            }else{

                console.log('productIndex: ' + productIndex);

                res.write(', ' + JSON.stringify(data) + '\n');

            }


        })
        .then(function() {

            res.write('],\n');
            res.write('"dashboards": [');

            const dashboardCursor = Dashboard.find().lean().cursor()

            dashboardCursor.eachAsync(function (data) {

                    dashboardIndex++;

                    if (dashboardIndex === 1) {

                        console.log('dashboardIndex: ' + dashboardIndex);

                        res.write(JSON.stringify(data) + '\n');

                    } else {

                        console.log('dashboardIndex: ' + dashboardIndex);

                        res.write(', ' + JSON.stringify(data) + '\n');

                    }


                })
                .then(function () {

                    res.write('],\n');
                    res.write('"metrics": [');

                    const metricCursor = Metric.find().lean().cursor();

                    metricCursor.eachAsync(function (data) {

                            metricIndex++;

                            if (metricIndex === 1) {

                                console.log('metricIndex: ' + metricIndex);

                                res.write(JSON.stringify(data) + '\n');

                            } else {

                                console.log('metricIndex: ' + metricIndex);

                                res.write(', ' + JSON.stringify(data) + '\n');

                            }


                        })
                        .then(function () {

                            res.write('],\n');
                            res.write('"events": [');

                            const eventCursor = Event.find().lean().cursor()

                            eventCursor.eachAsync(function (data) {

                                    eventIndex++;

                                    if (eventIndex === 1) {

                                        res.write(JSON.stringify(data) + '\n');

                                    } else {

                                        res.write(', ' + JSON.stringify(data) + '\n');

                                    }


                                })
                                .then(function () {

                                    res.write('],\n');
                                    res.write('"testruns": [');

                                    const testRunCursor = Testrun.find().lean().cursor();

                                    testRunCursor.eachAsync(function (data) {

                                            testRunIndex++;

                                            if (testRunIndex === 1) {

                                                res.write(JSON.stringify(data) + '\n');

                                            } else {

                                                res.write(', ' + JSON.stringify(data) + '\n');

                                            }


                                        })
                                        .then(function () {

                                            res.write('],\n');
                                            res.write('"releases": [');

                                            const releaseCursor = Release.find().lean().cursor();

                                            releaseCursor.eachAsync(function (data) {

                                                    releaseIndex++;

                                                    if (releaseIndex === 1) {

                                                        res.write(JSON.stringify(data) + '\n');

                                                    } else {

                                                        res.write(', ' + JSON.stringify(data) + '\n');

                                                    }


                                                })
                                                .then(function () {

                                                    res.write('],\n');
                                                    res.write('"testrunSummaries": [');

                                                    const testRunSummaryCursor = TestrunSummary.find().lean().cursor();

                                                    testRunSummaryCursor.eachAsync(function (data) {

                                                            testRunSummaryIndex++;

                                                            if (testRunSummaryIndex === 1) {

                                                                res.write(JSON.stringify(data) + '\n');

                                                            } else {

                                                                res.write(', ' + JSON.stringify(data) + '\n');

                                                            }


                                                        })
                                                        .then(function () {

                                                            res.write('],\n');
                                                            res.write('"gatlingDetails": [');

                                                            const gatlingDetailsCursor = GatlingDetails.find().lean().cursor();

                                                            gatlingDetailsCursor.eachAsync(function (data) {

                                                                    gatlingDetailsIndex++;

                                                                    if (gatlingDetailsIndex === 1) {

                                                                        res.write(JSON.stringify(data) + '\n');

                                                                    } else {

                                                                        res.write(', ' + JSON.stringify(data) + '\n');

                                                                    }


                                                                })
                                                                .then(function () {

                                                                    res.write('],\n');
                                                                    res.write('"templates": [');

                                                                    const templateCursor = Template.find().lean().cursor()

                                                                    templateCursor.eachAsync(function(data){

                                                                            templateIndex++;

                                                                            if(templateIndex === 1){

                                                                                res.write(JSON.stringify(data) + '\n');

                                                                            }else{

                                                                                res.write(', ' + JSON.stringify(data) + '\n');

                                                                            }

                                                                        })
                                                                        .then(function () {
                                                                            res.write('],\n');
                                                                            res.write('"runningTests": [');

                                                                            const runningTestCursor =  RunningTest.find().lean().cursor();

                                                                            runningTestCursor.eachAsync(function(data){

                                                                                    runningTestIndex++;

                                                                                    if(runningTestIndex === 1){

                                                                                        res.write(JSON.stringify(data) + '\n');

                                                                                    }else{

                                                                                        res.write(', ' + JSON.stringify(data) + '\n');

                                                                                    }

                                                                                })
                                                                                .then(function () {

                                                                                    res.write(']\n');
                                                                                    res.write('}');
                                                                                    res.end();
                                                                                })
                                                                        })
                                                                })
                                                        })
                                                })
                                        })
                                })
                        })
                })
        })


    //Product.find().lean().cursor({
    //        transform: () => {
    //            let index = 0;
    //            return (data) => {
    //                return (!(index++) ? '' : ',') + JSON.stringify(data);
    //            };
    //        }// invoke
    //    })
    //
    //    .on('data', function (product) {
    //
    //    res.write(product + '\n');
    //}).on('close', function () {
    //    res.write('],\n');
    //    res.write('"dashboards": [');
    //
    //    Dashboard.find().lean().cursor({
    //        transform: () => {
    //            let index = 0;
    //            return (data) => {
    //                return (!(index++) ? '' : ',') + JSON.stringify(data);
    //            };
    //        }// invoke
    //        })
    //        .on('data', function (dashboard) {
    //        res.write(dashboard + '\n');
    //    }).on('close', function () {
    //        res.write('],\n');
    //        res.write('"metrics": [');
    //
    //        Metric.find().lean().cursor({
    //            transform: () => {
    //                let index = 0;
    //                return (data) => {
    //                    return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                };
    //            }// invoke
    //            })
    //            .on('data', function (metric) {
    //            res.write(metric + '\n');
    //        }).on('close', function () {
    //            res.write('],\n');
    //            res.write('"events": [');
    //
    //            Event.find().lean().cursor({
    //                transform: () => {
    //                    let index = 0;
    //                    return (data) => {
    //                        return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                    };
    //                }// invoke
    //            })
    //                .on('data', function (event) {
    //                //event.hookEnabled = false;
    //                res.write(event + '\n');
    //            }).on('close', function () {
    //                res.write('],\n');
    //                res.write('"testruns": [');
    //                Testrun.find().lean().cursor({
    //                    transform: () => {
    //                        let index = 0;
    //                        return (data) => {
    //                            return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                        };
    //                    }// invoke
    //                  })
    //                    .on('data', function (testrun) {
    //                    res.write(testrun + '\n');
    //                }).on('close', function () {
    //                    res.write('],\n');
    //                    res.write('"templates": [');
    //
    //                    Template.find().lean().cursor({
    //                        transform: () => {
    //                            let index = 0;
    //                            return (data) => {
    //                                return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                            };
    //                        }// invoke
    //                        })
    //                        .on('data', function (template) {
    //                        res.write(template + '\n');
    //                    }).on('close', function () {
    //                        res.write('],\n');
    //                        res.write('"releases": [');
    //                        Release.find().lean().cursor({
    //                            transform: () => {
    //                                let index = 0;
    //                                return (data) => {
    //                                    return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                                };
    //                            }// invoke
    //                            })
    //                            .on('data', function (release) {
    //                            res.write(release + '\n');
    //                        }).on('close', function () {
    //                            res.write('],\n');
    //                            res.write('"testrunSummaries": [');
    //
    //                            TestrunSummary.find().lean().cursor({
    //                                transform: () => {
    //                                    let index = 0;
    //                                    return (data) => {
    //                                        return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                                    };
    //                                }// invoke
    //                                })
    //                                .on('data', function (testrunSummary) {
    //                                res.write(testrunSummary + '\n');
    //                            }).on('close', function () {
    //                                res.write('],\n');
    //                                res.write('"runningTests": [');
    //                                RunningTest.find().lean().cursor({
    //                                    transform: () => {
    //                                        let index = 0;
    //                                        return (data) => {
    //                                            return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                                        };
    //                                    }// invoke
    //                                    })
    //                                .on('data', function (runningTest) {
    //                                res.write(runningTest + '\n');
    //                                }).on('close', function () {
    //                                    res.write('],\n');
    //                                    res.write('"gatlingDetails": [');
    //
    //                                    GatlingDetails.find()
    //                                        .lean()
    //                                        .cursor({
    //                                            transform: () => {
    //                                                let index = 0;
    //                                                return (data) => {
    //                                                    return (!(index++) ? '' : ',') + JSON.stringify(data);
    //                                                };
    //                                            }// invoke
    //                                         })
    //                                        .on('data', function (gatlingDetails) {
    //                                            res.write(gatlingDetails + '\n');
    //                                        })
    //                                        .on('close', function () {
    //                                            res.write(']\n}');
    //                                            res.end();
    //                                        }).on('error', function (err) {
    //                                        res.send(500, {
    //                                            err: err,
    //                                            msg: 'Failed to get gatlingDetails from db'
    //                                        });
    //                                    });
    //                                    }).on('error', function (err) {
    //                                        res.send(500, {err: err,
    //                                            msg: 'Failed to get runningTests from db'
    //                                        });
    //                                    });
    //                                }).on('error', function (err) {
    //                                    res.send(500, {err: err,
    //                                        msg: 'Failed to get testrunSummaries from db'
    //                                    });
    //                                });
    //                            }).on('error', function (err) {
    //                                res.send(500, {err: err,
    //                                    msg: 'Failed to get releases from db'
    //                                });
    //                            });
    //                        }).on('error', function (err) {
    //                            res.send(500, {err: err,
    //                                msg: 'Failed to get templates from db'
    //                            });
    //                        });
    //                    }).on('error', function (err) {
    //                        res.send(500, {err: err,
    //                            msg: 'Failed to get test runs from db'
    //                        });
    //                    });
    //                }).on('error', function (err) {
    //                    res.send(500, {err: err,
    //                        msg: 'Failed to get events from db'
    //                    });
    //                });
    //            }).on('error', function (err) {
    //                res.send(500, {
    //                    err: err,
    //                    msg: 'Failed to get metrics from db'
    //                });
    //            });
    //        }).on('error', function (err) {
    //            res.send(500, {
    //                err: err,
    //                msg: 'Failed to get dashboards from db'
    //            });
    //        });
    //    }).on('error', function (err) {
    //        res.send(500, {
    //            err: err,
    //            msg: 'Failed to get products from db'
    //        });
    //    });
};
