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
        GitHubRemote.getAllRepos(req.user.token).then(function(repos){
            logger.log("ALL REPOS:" ,repos);
            res.render('project/new.html', {
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
        var repositories,_containers;
        GitHubRemote.getRepo(req.user.token, req.user.username,req.params.repo).then(function(repos){
            repositories = repos;
            return Containers.getPrimary();
        }).then(function(containers){
            _containers = containers;
            return Containers.getSecondary();
        }).then(function (containers) {
            res.render('project/new_config.html', {
                secondary_containers: containers,
                containers: _containers,
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
        }).then(function(project){
            return GitHubRemote.registerHook(req.user.token, req.user.username,req.params.repo,project.id);
        }).then(function () {
            req.flash("notifications",{status : "success", message : "Project " + project.name + " created successfully."});
            res.redirect('/projects');
        }).catch(function (err) {
            if (err) {
                logger.error(err);
                var repositories,_containers;
                GitHubRemote.getRepo(req.user.token, req.user.username,req.params.repo).then(function(repos){
                    repositories = repos;
                    return Containers.getPrimary();
                }).then(function(containers){
                    _containers = containers;
                    return Containers.getSecondary();
                }).then(function (containers) {
                    res.render('project/new_config.html', {
                        errors : err,
                        secondary_containers: containers,
                        containers: _containers,
                        repos : repositories
                    });
                })
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
                req.flash("notifications",{status : "success", message : "Project deleted successfully."});
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
        var _containers,_secondary_containers;
        var _project;
        Containers.getPrimary().then(function(containers){
            _containers = containers;
            return Containers.getSecondary();
        }).then(function (containers) {
            _secondary_containers = containers;
            return Projects.get(req.param('id'));
        }).then(function (project) {
            _project = project;
            return GitHubRemote.getRepo(req.user.token, req.user.username,project.name);
        }).then(function(repo){
            console.log(_project);
            res.render('project/config.html', {
                containers: _containers,
                secondary_containers: _secondary_containers,
                project: _project,
                repo : repo,
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
        Projects.update(req.param('id'), req.body.project).then(function () {
            req.flash("notifications", {status : "success", message : "Project updated successfully."});
            res.redirect('/projects/'+req.param('id')+'/config');
        }).catch(function (err) {
            console.log(err);
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    err = {
                        repo_url: ["Project for this repository already exists"]
                    };
                }
                logger.error(err);
                req.body.project.id = "dummy";

                Containers.getPrimary().then(function (containers) {
                    res.render('project/config.html', {
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