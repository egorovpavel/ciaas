'use strict';
var Queue = require('bull');
var db = require('sequelize');
var redis = require('redis');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require("bluebird");

var Hub = function(redisConfig,logger){
	var resultQueue = Queue('result',redisConfig.port,redisConfig.host);
    // Instance of redis used for streaming of output from container during build execution
    var reportChannel = redis.createClient(redisConfig.port,redisConfig.host);
	var redisClient =  redis.createClient(redisConfig.port,redisConfig.host);
	var instance = this;

    // Generates key to be used as channel name
    var getKey = function (id) {
        return "report:build:" + id;
    };

    var getBuild = function(job){
    	logger.info("BUILD-->");
    	var promise = Promise.pending();
		redisClient.lrange(getKey(job.data._id), 0, -1, function (err, entries) {
			if(err){
				promise.reject(err);
			}else{
				var build = {
					id : job.data._id,
					buildid : job.data.id,
                    project : job.data.project,
					status : job.data.status.StatusCode,
					started : job.data.started,
                    artifact : job.data.status.artifact,
					finished : job.data.finished,
					entries : entries,
                    reposity : job.data.reposity
				};
				promise.resolve(build);
			}
		});
		return promise.promise;
    };

    var emit = function (_event, data) {
		var promise = Promise.pending();
    	instance.emit(_event, data, function(err){
    		if(err){
    			promise.reject(err);
    		}else{
				promise.resolve(data);
    		}
    	});
    	return promise.promise;
    };

	var resultHandler = function(job, complete){
		logger.info("PROCESSING:",job.data);
		getBuild(job).then(function(build){
			logger.info("BUILD:",build);
			return emit('build_completed', build);
		}).then(function(build){
			logger.info("BUILD_completed:",build);
			return emit('build_notify', build);
		}).then(function(build){
			logger.info("BUILD_notify:",build);
			var channel = "channel_result_" + job.data._id;
	        reportChannel.publish(channel, JSON.stringify(job.data.status));
			complete();
		}).catch(function(err){
			logger.info("ERR:",err)
		});
	};

	return {
		start : function(){
			logger.info("STARTED");
			resultQueue.process(resultHandler);
		},
		onPersist : function(callback){
			instance.on('build_completed', callback);
		},
		onNotify : function(callback){
			instance.on('build_notify', callback);
		}
	};
};

util.inherits(Hub, EventEmitter);

module.exports = Hub;
