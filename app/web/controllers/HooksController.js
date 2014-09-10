'use strict';

var HooksController = function(app){
	var logger = app.get('logger');
	var Projects = app.get("repos").ProjectsRepo;
	var Builds = app.get("repos").BuildsRepo;
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));

    app.post('/hooks/:projectid', function (req, res) {
    	var _project;
    	var _id,_buildid;
        Projects.get(req.param('projectid')).then(function (project) {
        	logger.info("project");
            _project = project;
            return Builds.open(project);
        }).then(function (build) {
            _id = build.id;
            _buildid = build.build_id;
            return _project.getContainer();
        }).then(function (container) {
            var job = {
                _id: _id,
                id: _buildid,
                config: {
                    language: "JS",
                    timeout: 500000
                },
                container: {
                    primary: container.name
                },
                reposity: {
                    uri: _project.repo_url,
                    name: _project.name
                },
                skipSetup: false,
                payload: {
                    commands: _project.command.split("\n")
                }
            };
            return BuildQueue.add(job);
        }).then(function (build) {
            res.end("OK");
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("build DONE");
            res.end(".");
        });
    });
};

module.exports = HooksController;