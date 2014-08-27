'use strict';

function ContainerController(app) {
    var Containers = app.get("repos").ContainersRepo;

    app.get('/container', function (req, res) {
        Containers.all().then(function (containers) {
            res.render('container/list.html', {
                containers: containers
            });
        }).catch(function (err) {
            if (err) {
                console.log(err);
                res.status(501);
            }
        }).finally(function () {
            console.log("ACCOUNT LIST");
        });
    });

    app.get('/container/create', function (req, res) {
        res.render('container/form.html');
    });

    app.get('/container/:id', function (req, res) {
        Containers.get(req.param('id')).then(function (container) {
            res.render('container/detail.html', {
                container: container
            });
        })
            .catch(function (err) {
                console.log(err);
                if (err) {
                    res.status(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.get('/container/:id/edit', function (req, res) {
        Containers.get(req.param('id')).then(function (container) {
            res.render('container/form.html', {
                container: container
            });
        })
            .catch(function (err) {
                console.log(err);
                if (err) {
                    res.status(404);
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.post('/container/:id/edit', function (req, res) {
        Containers.update(req.param('id'), req.body.container)
            .then(function (container) {
                res.redirect('/container/' + container.id);
            })
            .catch(function (err) {
                if (err) {

                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        err = {
                            name: ["container with this name already exists"]
                        };
                    }
                    console.log(err);
                    req.body.container.id = "dummy";
                    res.render('container/form.html', {
                        errors: err,
                        container: req.body.container
                    });
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.post('/container/create', function (req, res) {
        console.log(req.body.container);
        Containers.create(req.body.container)
            .then(function (container) {
                res.redirect('/container/' + container.id);
            })
            .catch(function (err) {
                if (err) {
                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        err = {
                            name: ["container with this name already exists"]
                        };
                    }
                    console.log("ERROR", err);
                    res.render('container/form.html', {
                        errors: err,
                        container: req.body.container
                    });
                }
            })
            .finally(function () {
                console.log("ACCOUNT DONE");
            });
    });

    app.get('/container/:id/delete', function (req, res) {
        Containers.get(req.param('id'))
            .then(function (container) {
                res.render('container/delete.html', {
                    container: container
                });
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.status(404);
                }
            })
            .finally(function () {
                console.log("ACCOUNT delete show");
            });
    });

    app.post('/container/:id/delete', function (req, res) {
        Containers.delete(req.param('id'))
            .then(function (container) {
                res.redirect('/container');
            })
            .catch(function (err) {
                if (err) {
                    console.log(err);
                    res.status(501);
                }
            })
            .finally(function () {
                console.log("ACCOUNT deleteed");
            });
    });

};

module.exports = ContainerController;