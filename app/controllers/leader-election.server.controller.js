'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    winston = require('winston'),
    config = require('../../config/config'),
    _ = require('lodash'),
    clusterLeader = mongoose.model('clusterLeader'),
    mutex = require('node-mutex')({host: config.redisHost, port: config.redisPort });





exports.electLeader = electLeader;



function electLeader(id, callback){



  mutex.lock( 'leaderElection', function( err, unlock ) {
    if ( err ) {
      winston.error('Unable to aquire lock, error: ' + err.stack);
    }

      clusterLeader.find().exec(function(err, storedLeader){

        if(storedLeader.length === 0){

          var leader = new clusterLeader({clusterId: id});

          leader.save(function(err, leader){

            if(err){

              winston.error('Failed to save leader, error: ' + err.stack);
              unlock();
              callback(false);


            }else{

              winston.info('New leader elected, clusterId: ' + id);
              console.log('New leader elected, clusterId: ' + id);

              unlock();
              callback(true);

            }
          })

        }else {

          if (storedLeader[0].clusterId == id) {

            storedLeader[0].createdAt = new Date();

            storedLeader[0].save(function (err, updatedLeader) {

              if (err) {

                winston.error('Failed to save leader, error: ' + err.stack);
                unlock();
                callback(true);


              } else {

                winston.info('Leadership prolonged, clusterId: ' + id);
                console.log('Leadership prolonged, clusterId: ' + id);

                unlock();
                callback(true);

              }
            });

          } else {

            unlock();
            callback(false);

          }
        }
      })



  });


}
