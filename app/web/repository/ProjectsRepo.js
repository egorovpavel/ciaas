'use strict';
var db = require('../models');
var Promise = require('bluebird');

var ProjectsRepo = function () {
    var addProjectToAccount = function (account, projectProperties) {
        var promise = Promise.pending();
        var newproject = db.Project.build(projectProperties);
        var errors = newproject.validate();
        if (errors) {
            promise.reject(errors);
            return promise.promise;
        }

        return newproject.save().then(function (project) {
            newproject = project;
            return project.setContainer(projectProperties.container);
        }).then(function () {
            return newproject.setAccount(account);
        });
    };

    var updateProject = function (id, projectProperties) {
        return getById(id).then(function (project) {
            var promise = Promise.pending();
            project.command = projectProperties.command;
            var errors = project.validate();
            if (errors) {
                promise.reject(errors);
                return promise.promise;
            }
            return project.save().then(function (project) {
                return project.setContainer(projectProperties.container);
            });
        });
    };

    var getAll = function (account) {
        return db.Project.findAll({include: [db.Container], where: {AccountId: account.id}});
    };

    var getById = function (id) {
        return db.Project.find({include: [db.Container], where: {id: id}});
    };

    var deleteProject = function (id) {
        return getById(id).then(function (project) {
            return project.destroy();
        })
    };

    return {
        update: updateProject,
        create: addProjectToAccount,
        all: getAll,
        get: getById,
        'delete': deleteProject
    }
}();

module.exports = ProjectsRepo;