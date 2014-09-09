"use strict";
var logger = require('./common/logger')(process.env.NODE_ENV || 'development');
var express = require('express.io');
var http = require('http');
var swig = require('swig');
var fs = require('fs');
var db = require('./models');
var controllers_path = __dirname + '/controllers';
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var passport = require('passport');
var bcrypt = require('bcrypt');

var GitHubStrategy = require('passport-github').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "bd50fa6daf6a89fbf00e";
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "45fa3e239b03d97c1624adf908dd1e6dfd895404";
var GITHUB_REDIRECT =  process.env.GITHUB_REDIRECT || "http://localhost/auth/github/callback";


var app = express();
app.http().io();
app.set('env', process.env.NODE_ENV || 'development');
app.configure('development', function () {
    app.engine('html', swig.renderFile);
    app.set('port', config.app.port);
    app.set('redisPort', config.redis.port);
    app.set('redisHost', config.redis.host);
    app.set('view cache',false);
    swig.setDefaults({ cache: false });
});
app.configure('production', function () {
    app.engine('html', swig.renderFile);
    app.set('port', config.app.port);
    app.set('redisPort', config.redis.port);
    app.set('redisHost', config.redis.host);
});
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/app/partials', express.static(__dirname + '/views/angular'));
app.use('/app', express.static(__dirname + '/assets/dist'));
app.use('/app', express.static(__dirname + '/assets/src'));
app.use('/app', express.static(__dirname + '/assets/src/bower_components'));

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

var repos_path = __dirname + '/repository';
var repos = {};
fs.readdirSync(repos_path).forEach(function (file) {
    var name = file.replace('.js', '');
    repos[name] = require(repos_path + '/' + file);
});
app.set("repos", repos);

var Accounts = app.get("repos").AccountsRepo;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    Accounts.get(id).then(function(user){
        done(null, user);
    })
});
passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_REDIRECT
    },
    function (accessToken, refreshToken, profile, done) {
        Accounts.getByEmail(profile._json.email).then(function (account) {
            if(account){
                Accounts.update(account.username, {
                    token : accessToken
                },true).then(function(account){
                    done(null, account);    
                });
            }else{
                Accounts.create({
                    username : profile._json.login,
                    email: profile._json.email,
                    password: null,
                    token : accessToken
                },true).then(function (account) {
                    done(null, account);  
                }).finally(function () {
                    console.log("ACCOUNT DONE");
                });
            }
        });
    }
));
passport.use(new LocalStrategy(
    function (email, password, done) {
        var user;
        Accounts.getByEmail(email).then(function (account) {
            if(!account){
                this.reject();
                return this.promise;
            }
            user = account;
            return Accounts.checkPassword(password || "", account.password);
        }).then(function(valid){
            if (valid) {
                done(null, user);
            }else {
                done(null, false);
            }
        }).catch(function(){
            done(null, false);
        });
    }
));

fs.readdirSync(controllers_path).forEach(function (file) {
    require(controllers_path + '/' + file)(app);
});

logger.info("HI");
app.listen(app.get('port'),function () {
    logger.info("Express server listening on port " + app.get('port'));
});

app.on('error',function(){
    logger.error("Uncaught exception: " + err);
})

return app;
