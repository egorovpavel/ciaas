'use strict';

var Logger = require('winston');
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var npid = require('npid');
var Client = require('./lib/client.js');

try {
    var pid = npid.create('/var/run/ci_worker.pid');
    var controlledExit = function(){
    	pid.removeOnExit();
    	process.exit(1);
    };

    var client = new Client(config.host, config.port, Logger);
    process.on('SIGINT',controlledExit).on('SIGTERM', controlledExit);
    pid.removeOnExit();
} catch (err) {
    console.log(err);
    process.exit(1);
}

Logger.info("STARTED");