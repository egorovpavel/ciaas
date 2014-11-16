'use strict';
var db = require('../models');
var Promise = require('bluebird');

var ContainersRepo = function () {

    var createContainer = function (containerProperties) {
        var promise = Promise.pending();
        console.log(containerProperties);
        var container = db.Container.build(containerProperties);
        var errors = container.validate();
        if (errors) {
            promise.reject(errors);
            return promise.promise;
        }
        return container.save();
    };

    var updateContainer = function (id, containerProperties) {
        return getById(id).then(function (container) {
            var promise = Promise.pending();
            console.log("PROPS",containerProperties);
            console.log("CONT",container);
            container.name = containerProperties.name;
            container.type = containerProperties.type;
            container.description = containerProperties.description;
            container.command = containerProperties.command;
            container.defaultAlias = containerProperties.defaultAlias;
            container.displayName = containerProperties.displayName;
            container.icon = containerProperties.icon;
            var errors = container.validate();
            if (errors) {
                promise.reject(errors);
                return promise.promise;
            }
            return container.save();
        });
    };

    var getAll = function (page) {
        return db.Container.findAndCountAll({
            offset : (page-1 || 0) * 10,
            limit : 10
        });
    };

    var getById = function (id) {
        return db.Container.find(id);
    };

    var getPrimary = function () {
        return db.Container.findAll({where: {type: 'primary'}});
    };

    var getSecondary = function () {
        return db.Container.findAll({where: {type: 'secondary'}});
    };

    var countAll = function () {
        return db.Container.count();
    };

    var destroy = function (id) {
        return getById(id).then(function (container) {
            return container.destroy();
        })
    };

    return {
        update: updateContainer,
        create: createContainer,
        all: getAll,
        get: getById,
        count : countAll,
        getPrimary: getPrimary,
        getSecondary : getSecondary,
        'delete': destroy
    }
}();

module.exports = ContainersRepo;