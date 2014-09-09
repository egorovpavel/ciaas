'use strict';
var Authorization = require('./../common/Authorization');
function UserProjectsController(app) {
    var logger = app.get('logger');
    var Projects = app.get("repos").ProjectsRepo;
    var Accounts = app.get("repos").AccountsRepo;
    var GitHubRemote = app.get("repos").GitHubRemoteRepo;
    var Containers = app.get("repos").ContainersRepo;

    app.get('/projects',Authorization.isAuthenticated, function (req, res) {
        Projects.all(req.user).then(function (projects) {
            res.render('project/list.html', {
                req : req,
                projects: projects
            });
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(404);
            }
        }).finally(function () {
            logger.info("projects list");
        });
    });


    app.get('/projects/create',Authorization.isAuthenticated, function (req, res) {
        logger.console.log("USER TOKEN:" ,req.user.token);
        GitHubRemote.getAllRepos(req.user.token).then(function(repos){
            logger.console.log("ALL REPOS:" ,repos);
            res.render('project/new.html', {
                req : req,
                repos : repos
            });
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("project create step 1");
        });
    });

    app.get('/projects/create/:repo',Authorization.isAuthenticated, function (req, res) {
        var repositories;
        GitHubRemote.getRepo(req.user.token, req.user.username,req.params.repo).then(function(repos){
            repositories = repos;
            return Containers.getPrimary();  
        }).then(function (containers) {
            res.render('project/new_config.html', {
                req : req,
                containers: containers,
                repos : repositories
            });
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("project create step 2");
        });
    });



    app.post('/projects/create/:repo',Authorization.isAuthenticated, function (req, res) {
        var project;
        GitHubRemote.getRepo(req.user.token, req.user.username,req.params.repo).then(function(repo){
            project = req.body.project;
            project.name = repo.name;
            project.repo_url = repo.clone_url;
            logger.info(project);
            return Projects.create(req.user, project);
        }).then(function (containers) {
            res.redirect('/projects');
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(500);
            }
        }).finally(function () {
            logger.info("project create save");
        });
    });

    app.get('/projects/:id/delete',Authorization.isAuthenticated, function (req, res) {
        var acc;
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                acc = account;
                return Projects.get(req.param('id'))
            })
            .then(function (project) {
                res.render('project/delete.html', {
                    req : req,
                    account: acc,
                    project: project
                });
            })
            .catch(function (err) {
                if (err) {
                    logger.error(err);
                    res.status(404);
                }
            })
            .finally(function () {
                logger.info("project delete ask");
            });
    });

    app.post('/projects/:id/delete',Authorization.isAuthenticated, function (req, res) {
        Projects.delete(req.param('id'))
            .then(function () {
                res.redirect('/projects');
            })
            .catch(function (err) {
                if (err) {
                    logger.error(err);
                    res.status(501);
                }
            })
            .finally(function () {
                logger.info("project delete");
            });
    });

    app.get('/projects/:id/config',Authorization.isAuthenticated, function (req, res) {
        var _containers;
        Containers.getPrimary().then(function (containers) {
            _containers = containers;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            res.render('project/config.html', {
                req : req,
                containers: _containers,
                project: project,
                account: req.user
            });
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                res.status(404);
            }
        })
        .finally(function () {
            logger.info("project config");
        });
    });

    app.post('/projects/:id/config',Authorization.isAuthenticated, function (req, res) {
        var _account;
        Projects.update(req.param('id'), req.body.project).then(function () {
            res.redirect('/projects');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project for this repository already exists"]
                    };
                }
                logger.error(err);
                req.body.project.id = "dummy";

                Containers.getPrimary().then(function (containers) {
                    res.render('/project/config.html', {
                        req : req,
                        errors: err,
                        account: req.user,
                        containers: containers,
                        project: req.body.project
                    });
                });
            }
        }).finally(function () {
            logger.info("project config save");
        });
    });
}

module.exports = UserProjectsController;