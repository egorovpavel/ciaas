'use strict';

var Sequelize = require('sequelize');

var PersistanceHandler = function(sqlConfig){
	var db = new Sequelize(sqlConfig.db, process.env.MYSQL_USER || 'root', process.env.MYSQL_PASS || 'root', {
        dialect: 'mysql',
        port: sqlConfig.port,
        host: sqlConfig.host
    });

	var closeBuild = function(id, buildId, fullLog, fullResult, started, finished){
		console.log("CLOSING BUILD ", [id,buildId, fullLog, fullResult, started, finished]);

		var params = {
			id : id,
			started : new Date(started),
			finished : new Date(finished),
			log_build : JSON.stringify(fullLog),
			log_result : JSON.stringify(fullResult),
			status_result : (fullResult == 0) ? "SUCCESS" : ((fullResult == 100) ? "TIMEOUT" : "FAILED")
		}
		//console.log(params);
		return db.query(
		    'UPDATE Builds SET started = :started, finished = :finished, log_build = :log_build, log_result = :log_result, status_exec = "COMPLETE", status_result = :status_result WHERE id = :id', null,
	    	{ raw: true }, params
	  	);
	};
	return {
		closeBuild : closeBuild
	};
};


module.exports = PersistanceHandler;