'use strict';

var redis = require('redis');
var ConvertAsci = require('ansi-to-html');
var _ = require('lodash');

var OutputFeedRepo = function (port, host) {
    var convert = new ConvertAsci();
    var redisClient = redis.createClient(port, host);
    var firstMessage = true;
    var getKey = function (id) {
        return "report:build:" + id;
    };
    var transform = function (id, message, callback) {
        var msg = JSON.parse(message);
        if (msg.data) {
            var data = {
                id: id,
                line: msg.line,
                data: convert.toHtml(msg.data)
            };
            if (firstMessage) {
                if (msg.line > 0) {
                    redisClient.lrange(getKey(id), 0, data.line - 1, function (err, entries) {
                        var en = _.map(entries, function (item, idx) {
                            return {
                                id: id,
                                line: idx,
                                data: convert.toHtml(item)
                            }
                        });
                        en.push(data);
                        _.forEach(en, function (elm) {
                            callback("channel_" + id, elm);
                        });
                    });
                } else {
                    callback("channel_" + id, data);
                }
                firstMessage = false;
            } else {
                callback("channel_" + id, data);
            }
        }
    };

    return {
        transform: transform
    };
};

module.exports = OutputFeedRepo;