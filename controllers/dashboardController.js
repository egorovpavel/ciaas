"use strict";

var redis = require('redis');
var _ = require('lodash');

module.exports = function (app) {
    var BuildQueue = app.get("repos").BuildQueueRepo(app.get('redisPort'), app.get('redisHost'));
    var redisFeedSubscriber = redis.createClient(app.get('redisPort'), app.get('redisHost'));

    app.get('/dashboard', function (req, res, next) {
        res.render('common/app');
    });

    app.get('/dashboard/build/:id', function (req, res, next) {
        res.render('dashboard/build', {
            buildId: req.params.id,
            output: "output"
        });
    });
    app.io.route('build.feed', function (req) {
        var id = req.data.id;
        var OutputFeed = app.get("repos").OutputFeedRepo(app.get('redisPort'), app.get('redisHost'));
        redisFeedSubscriber.on('message', function (channel, message) {
            if (channel == "channel_result_" + id) {
                req.io.emit("channel_result_" + id, JSON.parse(message));
                redisFeedSubscriber.unsubscribe("channel_result_" + id);
                redisFeedSubscriber.unsubscribe("channel_" + id);
            } else {
                OutputFeed.transform(message, function (channelName, message) {
                    req.io.emit(channelName, message);
                });
            }
        });
        redisFeedSubscriber.subscribe("channel_" + id);
        redisFeedSubscriber.subscribe("channel_result_" + id);

    });
    app.post('/dashboard', function (req, res, next) {
        var item = req.param('item');
        item.id = Math.round(Math.random() * 100, 3);

        BuildQueue.add(item);
        res.json({id: item.id});
    });
};
