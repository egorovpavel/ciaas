'use strict';

var passport = require('passport');
var Authorization = require('./../common/Authorization');
function LoginController(app) {
    var logger = app.get('logger');
    var Accounts = app.get("repos").AccountsRepo;

    app.get('/login',Authorization.isGuest, function (req, res) {
        console.log("LOGINFLASH:",app.locals.getNotifications());
        res.render('login/login.html');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/signup',Authorization.isGuest, function (req, res) {
        res.render('login/signup.html');
    });

    // GET /auth/github
    app.get('/auth/github',Authorization.isGuest,passport.authenticate('github',{
        scope: ['write:repo_hook','repo']
    }),function(req, res) {
        if(req.user.admin){
            res.redirect('/dashboard');
        }else{
            res.redirect('/projects');
        }
    });

    app.post('/login',Authorization.isGuest,
        passport.authenticate('local', {
            failureRedirect: '/login',
            successFlash:true,
            failureFlash: true
        }),function(req, res) {
            if(req.user.admin){
                res.redirect('/dashboard');
            }else{
                res.redirect('/projects');
            }
        });

    app.post('/signup',Authorization.isGuest,function (req, res) {
        Accounts.create(req.body.account).then(function (account) {
            res.redirect('/projects');
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                    err = {};
                    err[key] = [key + " already exists"];
                }
                res.render('login/signup.html', {
                    errors: err,
                    account: req.body.account
                });
            }
        }).finally(function () {
            logger.info("ACCOUNT DONE");
        });
    });

    // GET /auth/github/callback
    app.get('/auth/github/callback',Authorization.isGuest,passport.authenticate('github', { failureRedirect: '/login',successFlash:true,failureFlash: true}),function (req, res) {
        res.redirect('/projects');
    });

};
module.exports = LoginController;