'use strict';
  /**
   * Module dependencies.
   */
  var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Event = mongoose.model('Event'),
    Testrun = mongoose.model('Testrun'),
    Dashboard = mongoose.model('Dashboard'),
    Product = mongoose.model('Product'),
    testruns = require('./testruns.server.controller.js'),
    _ = require('lodash'),
    winston = require('winston'),
    runningTest = require('./running-test.server.controller');

  exports.updateAllDashboardEvents = updateAllDashboardEvents;
  exports.updateAllProductEvents = updateAllProductEvents;
  exports.create = create;
  exports.read = read;
  exports.update = update;
  exports.delete = deleteFn;
  exports.list = list;
  exports.eventsForDashboard = eventsForDashboard;
  exports.checkEvents = checkEvents;
  exports.eventsForTestRun = eventsForTestRun;
  exports.eventsForTestRunId = eventsForTestRunId;
  exports.eventByID = eventByID;


  function updateAllDashboardEvents(req, res){

    var regExpDashboardName = new RegExp(req.params.oldDashboardName, 'igm');

    Event.find({
      $and: [
        { productName: req.params.oldProductName },
        { dashboardName: req.params.oldDashboardName }
      ]}).exec(function(err, events){
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {

            _.each(events, function(event){


              event.dashboardName = req.params.newDashboardName;
              event.testRunId = event.testRunId.replace(regExpDashboardName, req.params.newDashboardName);

              event.save(function (err) {
                if (err) {
                  return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                } else {
                  //res.jsonp(event);
                }
              });
            });

            res.jsonp(events);
          }



      });
  }

function updateAllProductEvents(req, res){

  var regExpProductName = new RegExp(req.params.oldProductName, 'igm');

  Event.find({productName: req.params.oldProductName}).exec(function(err, events){
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {

      _.each(events, function(event){


        event.productName = req.params.newProductName;
        event.testRunId = event.testRunId.replace(regExpProductName,req.params.newProductName);

        event.save(function (err) {
          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {
            //res.jsonp(event);
          }
        });
      });

      res.jsonp(events);
    }
});
}

/**
 * Create a Event
 */
function create(req, res) {
  var event = new Event(req.body);
  event.user = req.user;
  event.save(function (err, savedEvent) {
    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {


      if(savedEvent.eventDescription === 'start'){

        runningTest.updateRunningTest(savedEvent.productName, savedEvent.dashboardName, savedEvent.testRunId, function(message){

          var response = {};
          response.event = savedEvent;
          response.message = message;

          res.jsonp(response);

        });


      }else{

        res.jsonp(savedEvent);

      }
    }
  });
};

  /**
   * Show the current Event
   */
  function read(req, res) {

    res.jsonp(req.event);

  };

  /**
   * Update a Event
   */

  function update(req, res) {
    var event = req.event;
    event = _.extend(event, req.body);
    event.save(function (err) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(event);
      }
    });
  };
  /**
   * Delete an Event
   */
  function deleteFn(req, res) {
    var event = req.event;
    event.remove(function (err) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(event);
      }
    });
  };
  /**
   * List of Events
   */
  function list(req, res) {
    Event.find().sort('-created').populate('user', 'displayName').exec(function (err, events) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(events);
      }
    });
  };
  /*
   * List events for dashboard
   */
  function eventsForDashboard(req, res) {
    Event.find({
      $and: [
        { productName: req.params.productName },
        { dashboardName: req.params.dashboardName }
      ]
    }).sort('-eventTimestamp').exec(function (err, events) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(events);
      }
    });
  };
  /*
   * Check if event already exists for product-dashboard-testrun combination
   */
  function checkEvents(req, res) {
    Event.findOne({
      $and: [
        { productName: req.params.productName },
        { dashboardName: req.params.dashboardName },
        { testRunId: req.params.testRunId },
        { eventDescription: req.params.eventDescription }
      ]
    }).exec(function (err, event) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        if (!event) {
          return res.status(404).send({ message: 'No event has been found' });
        } else {
          res.jsonp(event);
        }
      }
    });
  };
  /*
   * List events for testrun
   */
  function eventsForTestRun(req, res) {
    Event.find({
      $and: [
        { productName: req.params.productName },
        { dashboardName: req.params.dashboardName }
      ],
      eventTimestamp: {
        $lte: req.params.until,
        $gte: req.params.from
      }
    }).sort('-eventTimestamp').exec(function (err, events) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(events);
      }
    });
  };

  /*
   * List events for testrun id
   */
  function eventsForTestRunId(req, res) {
    Event.find({
      $and: [
        { productName: req.params.productName },
        { dashboardName: req.params.dashboardName },
        { testRunId: req.params.testRunId }
      ]
    }).sort('eventTimestamp').exec(function (err, events) {
      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else {
        res.jsonp(events);
      }
    });
  };
  /*
   * Event middleware
   */
  function eventByID(req, res, next, id) {
    Event.findById(id).exec(function (err, event) {
      if (err)
        return next(err);
      if (!event)
        return next(new Error('Failed to load Event ' + id));
      req.event = event;
      next();
    });
  };
  /**
   * Event authorization middleware
   */
  //exports.hasAuthorization = function (req, res, next) {
  //  if (req.event.user.id !== req.user.id) {
  //    return res.status(403).send('User is not authorized');
  //  }
  //  next();
  //};
