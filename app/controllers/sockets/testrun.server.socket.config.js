'use strict';
var loadModuleChangeEmitter = require('../models/testrun.server.model').loadModuleChangeEmitter;

// Create the socket configuration
module.exports = function(io, socket) {
    loadModuleChangeEmitter(io,socket);
};
