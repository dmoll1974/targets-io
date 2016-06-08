
/**
 * Broadcast updates to client when the testrun model changes
 */

'use strict';

var Testrun= require('./testrun.server.model.js');

exports.register = function(socket) {

    Testrun.schema.post('save', function (doc) {
        onSave(socket, doc);
    });

    Testrun.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}


function onSave(socket, doc) {
    console.log('emitting message from socket ' + socket.id);
    socket.emit('message', {event: 'saved', testrun: doc});
}

function onRemove(socket, doc) {
    socket.emit('message', {event: 'saved', testrun: doc});
}
