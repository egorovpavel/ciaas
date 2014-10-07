'use strict';
var nodemailer = require('nodemailer');
var swig  = require('swig');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

var EmailNotificationHandler = function(logger){
    var handle = function(build, done){
        var diff = (new Date(build.finished)).getTime() - (new Date(build.started)).getTime();
        build.duration = new Date(diff);
        var body = swig.renderFile('./templates/build_report.html', {
            build: build
        });
        transporter.sendMail({
            from: 'minion@cipsisel.com',
            to: 'egorovpasha@gmail.com',
            subject: "Build "+ build.reposity.name +" #"+build.buildid+ (!build.status ? " successful" : " failed"),
            html: body
        },done);
        done();
    };

    return {
        handle : handle
    }
};

module.exports = EmailNotificationHandler;