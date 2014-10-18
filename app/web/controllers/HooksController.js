'use strict';

var HooksController = function(app){
	var logger = app.get('logger');
	var Projects = app.get("repos").ProjectsRepo;
	var Builds = app.get("repos").BuildsRepo;
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var Accounts = app.get("repos").AccountsRepo;

    app.post('/hooks/:projectid', function (req, res) {
    	var _project;
    	var _id,_buildid,_branch,_account;
        Projects.get(req.param('projectid')).then(function (project) {
            _project = project;
            return Accounts.get(project.AccountId);
        }).then(function(account){
            _account = account;
            return GitHubRemote.getHeadCommitInfo(_account.token,_account.username,_project.name, _project.default_branch);
        }).then(function(branch){
            _branch = branch;
            return Builds.open(_project,{
                commit_id : branch.commit.sha,
                commit_message : branch.commit.commit.message,
                commit_author : branch.commit.commit.committer.name
            });
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
                artifact_path: _project.artifact_path,
                reposity: {
                    uri: _project.repo_url,
                    name: _project.name,
                    branch : _project.default_branch,
                    commit : _branch.commit
                },
                skipSetup: false,
                payload: {
                    commands: _project.command.split("\r\n")
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
        });
    });
};

module.exports = HooksController;