'use strict';
var ConvertAsci = require('ansi-to-html');
var _ = require('lodash');
var redis = require('redis');
var Authorization = require('./../common/Authorization');
function UserBuildController(app) {
    var logger = app.get('logger');
    var convert = new ConvertAsci();
    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    var Builds = app.get("repos").BuildsRepo;
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var redisFeedSubscriber = redis.createClient(app.get('redisPort'), app.get('redisHost'));

    app.get('/projects/:id/build',Authorization.isAuthenticated, function (req, res) {
        var viewbag = {};
        Projects.get(req.param('id')).then(function (project) {
            viewbag.project = project;
            return Builds.all(project)
        }).then(function (builds) {
            viewbag.builds = builds;
            res.render('build/list.html', viewbag);
        }).catch(function (err) {
            if (err) {
                logger.info(err);
                res.status(404);
            }
        }).finally(function () {
            logger.info("BUILDS LIST");
        });
    });
    
    app.post('/projects/:id/build',Authorization.isAuthenticated, function (req, res) {
        var _buildid;
        var _project;
        var _branch;
        var _id;
        Projects.get(req.param('id')).then(function (project) {
            _project = project;
            return GitHubRemote.getHeadCommitInfo(req.user.token,req.user.username,project.name, project.default_branch);
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
            res.redirect('/projects/' + req.param('id') + "/build/" + _buildid);
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("build DONE");
        });
    });

    app.get('/projects/:id/build/:num',Authorization.isAuthenticated, function (req, res) {
        var viewbag = {bucket:"https://s3-eu-west-1.amazonaws.com/" + process.env.S3_BUCKET_ARTIFACT || "dev-artifact"};
        Projects.get(req.param('id')).then(function (project) {
            viewbag.project = project;
            return Builds.get(project, req.param('num'));
        }).then(function(build){
            viewbag.build = build;
            return Builds.getLogs(build.log_build,build.status_exec);
        }).then(function (log) {
            if (viewbag.build.status_exec == 'COMPLETE') {
                var log_build = JSON.parse(log);
                viewbag.log = [];
                _.each(log_build, function (l) {
                    if (/\r/.test(l) && /\r/.test(viewbag.log[viewbag.log.length - 1])) {
                        viewbag.log.pop();
                    } else {
                        viewbag.log.push(convert.toHtml(l));
                    }
                });
                logger.info("COMPLETE" + viewbag);
                res.render('build/detail_static.html', viewbag);
            } else {
                console.log("RENDER");
                res.render('build/detail.html', viewbag);
            }
        }).catch(function (err) {
            if(err.message && err.message == '403'){
                console.log("102:", err);
                logger.info(err);
                res.redirect('/projects/' + req.param('id') + "/build/" + req.param('num'));
            }else{
                console.log("FAIL:", err);
                logger.info(err);
                res.status(404);
                res.end();
            }
        }).error(function(err){
            logger.error(err);
        }).finally(function () {
            logger.info("BUILD");
        });
    });

}

module.exports = UserBuildController;
