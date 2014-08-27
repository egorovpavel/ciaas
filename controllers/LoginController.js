'use strict';

var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var GITHUB_CLIENT_ID = "f6bf18dd474f62e7ccc0";
var GITHUB_CLIENT_SECRET = "01c08580bb27243720e338213150b54357b53a1d";

function LoginController(app) {
    var Accounts = app.get("repos").AccountsRepo;

    app.get('/login', function (req, res) {
        res.render('login/login.html');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/signup', function (req, res) {
        res.render('login/signup.html');
    });

    // GET /auth/github
    // Use passport.authenticate() as route middleware to authenticate the
    // request. The first step in GitHub authentication will involve redirecting
    // the user to github.com. After authorization, GitHub will redirect the user
    // back to this application at /auth/github/callback
    app.get('/auth/github',passport.authenticate('github'),function (req, res) {
            // The request will be redirected to GitHub for authentication, so this
            // function will not be called.
        }
    );

    app.post('/signup',function (req, res) {
            Accounts.create(req.body.account)
                .then(function (account) {
                    res.redirect('/account/' + account.username);
                })
                .catch(function (err) {
                    if (err) {
                        console.log();
                        if (err.code && err.code == 'ER_DUP_ENTRY') {
                            var key = err.message.indexOf("for key 'email'") > 0 ? "email" : "username";
                            err = {};
                            err[key] = [key + " already exists"];
                        }
                        console.log(err);
                        res.render('account/form.html', {
                            errors: err,
                            account: req.body.account
                        });
                    }
                })
                .finally(function () {
                    console.log("ACCOUNT DONE");
                });
        }
    );

    // GET /auth/github/callback
    // Use passport.authenticate() as route middleware to authenticate the
    // request. If authentication fails, the user will be redirected back to the
    // login page. Otherwise, the primary route function function will be called,
    // which, in this example, will redirect the user to the home page.
    app.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/login' }),function (req, res) {
            res.redirect('/');
    });

};


// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete GitHub profile is serialized
// and deserialized.
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// Usage of GitHubStrategy within Passport.
// Strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and GitHub
// profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {

        console.log("accessToken:",accessToken);
        console.log("refreshToken:",refreshToken);
        console.log("profile:",profile);

        process.nextTick(function () {
            // To keep the example simple, the user's GitHub profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the GitHub account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

//The local authentication strategy authenticates users using a username and password.
// The strategy requires a verify callback,
// which accepts these credentials and calls done providing a user.
passport.use(new LocalStrategy(
    function (username, password, done) {
        Accounts.getByUsername(username).then(function (account) {
            if (validatePassword(password, account.password)) {
                done(null, true);
            }
            else {
                done(null, false);
            }
        });
    }
));


var validatePassword = function (pwd1, pwd2) {
    return pwd1 == pwd2;
};
module.exports = LoginController;