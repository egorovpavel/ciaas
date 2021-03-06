'use strict';

var Sequelize = require('sequelize');

var PersistanceHandler = function(sqlConfig,logger){
	var db = new Sequelize(process.env.MYSQL_DB || 'ci', process.env.MYSQL_USER || 'root', process.env.MYSQL_PASS || 'root', {
        dialect: 'mysql',
        port: process.env.MYSQL_PORT || '3306',
        host: process.env.MYSQL_HOST || 'localhost'
    });

	var handle = function(build, done){
        console.log("ARTIFACT",build.artifact);
		var params = {
			id : build.id,
			started : new Date(build.started),
			finished : new Date(build.finished),
			log_build : build.id,
            artifact_path : build.artifact.name,
			log_result : JSON.stringify(build.status),
			status_result : (build.status == 0) ? "SUCCESS" : ((build.status == 100) ? "TIMEOUT" : "FAILED")
		};
		db.query(
		    'UPDATE Builds SET artifact_path = :artifact_path, started = :started, finished = :finished, log_build = :log_build, log_result = :log_result, status_exec = "COMPLETE", status_result = :status_result WHERE id = :id', null,
	    	{ raw: true }, params
	  	).then(function(){
	  		done();
	  	});
	};
	return {
		handle : handle
	};
};


module.exports = PersistanceHandler;