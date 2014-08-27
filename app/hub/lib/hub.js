'use strict';
var Queue = require('bull');
var db = require('sequelize');
var redis = require('redis');

var Hub = function(redisConfig, persistanceHandler, notificationHandler,logger){
	var resultQueue = Queue('result',redisConfig.port,redisConfig.host);
	var statusQueue = Queue('status',redisConfig.port,redisConfig.host);
	var redisClient =  redis.createClient(redisConfig.port,redisConfig.host);

    // Generates key to be used as channel name
    var getKey = function (id) {
        return "report:build:" + id;
    };

	var statusHandler = function(job, complete){
		persistanceHandler.updateStatus(job.data).then(complete);
	}

	var resultHandler = function(job, complete){
		logger.info("HANDLING", job.data);
		var buildid = job.data.id;
		var _id = job.data._id;
		redisClient.lrange(getKey(_id), 0, -1, function (err, entries) {
			logger.info("LINES",entries);
			persistanceHandler.closeBuild(_id,buildid,entries,job.data.status.StatusCode,job.data.started, job.data.finished).then(function(){
				complete();
			});
		});
	}

	var startHandle = function(){
		logger.info("STARTED");
		resultQueue.process(resultHandler);
		statusQueue.process(statusHandler);
	};

	return {
		handle : startHandle
	}
};

module.exports = Hub;