'use strict';
var Authorization = require('./../common/Authorization');
function AccountController(app) {
    var logger = app.get('logger');
    var Accounts = app.get("repos").AccountsRepo;


    app.get('/dashboard/account', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.all(req.query['page'] || 1).then(function (accounts) {
            res.render('dashboard/account/list.html', {accounts: accounts});
        }).catch(function (err) {
            if (err) {
                logger.info(err);
                res.status(501);
            }
        }).finally(function () {
            logger.info("ACCOUNT LIST");
        });
    });

    app.get('/dashboard/account/create', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        res.render('dashboard/account/form.html');
    });

    app.get('/dashboard/account/:username/edit', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username')).then(function (account) {
            res.render('dashboard/account/form.html', {account: account});
        })
        .catch(function (err) {
            logger.info(err);
            if (err) {
                res.status(404).send();
            }
        })
        .finally(function () {
            logger.info("ACCOUNT DONE");
        });
    });

    app.post('/dashboard/account/:username/edit', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.update(req.param('username'), req.body.account)
            .then(function (account) {
                req.flash("notifications",{status : "success", message : "Account  " + account.username + " updated successfully."});
                res.redirect('/dashboard/account');
            })
            .catch(function (err) {
                if (err) {
                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        err = {
                            username: ["User with this name already exists"]
                        };
                    }
                    logger.error(err);
                    req.body.account.id = "dummy";
                    app.set("notifications",{status : "error", message : "Unable to save account"});
                    res.render('dashboard/account/form.html', {
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.post('/dashboard/account/create', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.create(req.body.account)
            .then(function (account) {
                req.flash("notifications",{status : "success", message : "Account " + account.username + " created successfully."});
                res.redirect('/dashboard/account');
            })
            .catch(function (err) {
                if (err) {
                    logger.info();
                    if (err.code && err.code == 'ER_DUP_ENTRY') {
                        var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                        err = {};
                        err[key] = [key + " already exists"];
                    }
                    logger.info(err);
                    app.set("notifications",{status : "error", message : "Unable to create accout"});
                    res.render('dashboard/account/form.html', {
                        errors: err,
                        account: req.body.account
                    });
                }
            })
            .finally(function () {
                logger.info("ACCOUNT DONE");
            });
    });

    app.get('/dashboard/account/:username/delete', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.getByUsername(req.param('username'))
            .then(function (account) {
                res.render('dashboard/account/delete.html', {
                    account: account
                });
            })
            .catch(function (err) {
                if (err) {
                    logger.info(err);
                    res.status(404).send();
                }
            })
            .finally(function () {
                logger.info("ACCOUNT delete show");
            });
    });

    app.post('/dashboard/account/:username/delete', Authorization.isAuthenticated,Authorization.isAdmin, function (req, res) {
        Accounts.delete(req.param('username'))
        .then(function (account) {
            req.flash("notifications",{status : "success", message : "Account  deleted successfully."});
            res.redirect('/dashboard/account');
        })
        .catch(function (err) {
            if (err) {
                logger.info(err);
                res.status(501).send();
            }
        })
        .finally(function () {
            logger.info("ACCOUNT deleteed");
        });
    });

};

module.exports = AccountController;