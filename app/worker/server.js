'use strict';

var Logger = require('./lib/Logger');
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var npid = require('npid');
var Client = require('./lib/Client');
var cluster = require('cluster');
var numCPUs = process.env.CONCURRENCY || 10;

try {
    if (cluster.isMaster) {
        var pid = npid.create('/var/run/ci_worker.pid');
        var controlledExit = function(){
            pid.removeOnExit();
            process.exit(1);
        };
        // Fork workers.
        for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
        cluster.on('online', function(worker) {
            Logger.info("WORKER SLAVE IS STARTED ID=",worker.process.pid);
        });
        cluster.on('exit', function(worker, code, signal) {
            Logger.info('WORKER SLAVE %d DIED (%s).', worker.process.pid, signal || code);
        });
        Logger.info("STARTED WORKER CLUSTER WITH CONCURRENCY = " + numCPUs);
    }else{
        var client = new Client(config.host, config.port, Logger);
    }

    if (cluster.isMaster) {
        process.on('SIGINT',controlledExit).on('SIGTERM', controlledExit);
        pid.removeOnExit();
    }
} catch (err) {
    console.log(err);
    process.exit(1);
}