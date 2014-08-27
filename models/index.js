var fs = require('fs')
    , path = require('path')
    , Sequelize = require('sequelize')
    , lodash = require('lodash')
    , config = require('./../config.json')[process.env.NODE_ENV || 'development']
    , sequelize = new Sequelize(process.env.MYSQL_DB || 'ci', process.env.MYSQL_USER || 'root', process.env.MYSQL_PASS || 'root', {
        dialect: 'mysql',
        port: process.env.MYSQL_PORT || '3306',
        host: process.env.MYSQL_HOST || 'localhost'
    })
    , db = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file))
        db[model.name] = model
    });

Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db)
    }
});

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);