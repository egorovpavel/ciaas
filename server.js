"use strict";
var express = require('express.io');
var http = require('http');
var swig = require('swig');
var fs = require('fs');
var db = require('./models');
var controllers_path = __dirname + '/controllers';
var config = require('./config.json')[process.env.NODE_ENV || 'development'];
var passport = require('passport');

console.log(process.env);
console.log(config);

var app = express();
app.http().io();
app.set('env', process.env.NODE_ENV || 'development');
app.configure('development', function () {
    app.engine('html', swig.renderFile);
    app.set('port', config.app.port);
    app.set('redisPort', config.redis.port);
    app.set('redisHost', config.redis.host);
    app.disable('view cache');
});
app.configure('production', function () {
    app.engine('html', swig.renderFile);
    app.set('port', config.app.port);
    app.set('redisPort', config.redis.port);
    app.set('redisHost', config.redis.host);
});
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(require('connect').bodyParser());
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
fs.readdirSync(controllers_path).forEach(function (file) {
    require(controllers_path + '/' + file)(app);
});

db.sequelize
    .sync()
    .complete(function (err) {
        if (err) {
            throw err[0]
        } else {
            app.listen(
                app.get('port'),
                function () {
                    console.log("Express server listening on port " + app.get('port'));
                }
            );
        }
    });


return app;
