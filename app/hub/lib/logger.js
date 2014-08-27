'use strict';
var logger = require('winston');
// Logger configuration
// ====================
//
// Configures Logger instance. Uses `winston` library to log to different destinations
var Logger = function (env) {
    env = env || "test";
    var levels = {
        "test": "error",
        "dev": "debug",
        "production": "info"
    };

    logger.setLevels({debug: 0, info: 1, silly: 2, warn: 3, error: 4});
    logger.addColors({debug: 'green', info: 'cyan', silly: 'magenta', warn: 'yellow', error: 'red'});
    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, { level: levels[env], colorize: true });
    return logger;
};

module.exports = Logger;
