'use strict';

var passport = require('passport');

function LoginController(app) {
    var Accounts = app.get("repos").AccountsRepo;

    app.get('/login', function (req, res) {
        res.render('login/login.html',{req:req});
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/signup', function (req, res) {
        res.render('login/signup.html',{req:req});
    });

    // GET /auth/github
    app.get('/auth/github',passport.authenticate('github'),function (req, res) {});

    app.get('/auth/github/project',passport.authenticate('github',{
        scope: ['write:repo_hook','repo'],
        state: 'newproject'
    }),function (req, res) {});

    app.post('/login',
        passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login',failureFlash: false })
    );

    app.post('/signup',function (req, res) {
        Accounts.create(req.body.account).then(function (account) {
            res.redirect('/account/' + account.username);
        }).catch(function (err) {
            if (err) {
                if (err.code && err.code == 'ER_DUP_ENTRY') {
                    var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                    err = {};
                    err[key] = [key + " already exists"];
                }
                res.render('login/signup.html', {
                    req : req,
                    errors: err,
                    account: req.body.account
                });
            }
        }).finally(function () {
            console.log("ACCOUNT DONE");
        });
    });

    // GET /auth/github/callback
    app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/login' }),function (req, res) {
        res.redirect('/');
    });

};
module.exports = LoginController;