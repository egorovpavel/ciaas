'use strict';
var Hub = require('./lib/hub.js');
var Logger = require('winston');
var config = require('./config.json')[process.env.NODE_ENV || 'development'];

var SqlPersistanceHandler = require('./lib/SQLPersistanceHandler.js');
var S3LogPersistanceHandler = require('./lib/S3LogPersistanceHandler.js');

var hub = new Hub(config.redis,Logger);

hub.onPersist(new SqlPersistanceHandler(config.mysql,Logger).handle);
hub.onPersist(new S3LogPersistanceHandler(config.s3,Logger).handle);

hub.onNotify(function(build,done){
	console.log("notify");
	done();
});

hub.start();