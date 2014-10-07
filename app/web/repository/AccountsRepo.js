'use strict';
var db = require('../models');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');

var AccountsRepo = function () {

    var hashPassword = function(password){
        var promise = Promise.pending();
        if(!password){
            promise.resolve(null) ;
        }else{
            bcrypt.hash(password, 8, function(err, hash) {
                if(err){
                    promise.reject(err);
                }else{
                    promise.resolve(hash)
                }
            });
        }
        return promise.promise;
    };

    var checkPassword = function(password, hash){
        var promise = Promise.pending();
        if(!password || !hash){
            promise.resolve(false) ;
        }else{
            bcrypt.compare(password, hash, function(err, res) {
                if(err){
                    promise.reject(err);
                }else{
                    promise.resolve(res)
                }
            });
        }
        return promise.promise;
    };

    var createAccount = function (accountProperties, nopassword) {

        return hashPassword(accountProperties.password).then(function(hash){
            var promise = Promise.pending();
            var account = db.Account.build(accountProperties);
            if(!nopassword){
                var errors = account.validate({skip:["password"]});
            }else{
                var errors = account.validate();
            }
            if (errors) {
                promise.reject(errors);
                return promise.promise;
            }
            account.password = hash;
            return account.save();
        });
    };
    var updateAccount = function (username, accountProperties, nopassword) {
        var hashedpassword;
        return hashPassword(accountProperties.password).then(function(hash){
            hashedpassword = hash;
            return getByUsername(username);
        }).then(function (account) {
            var promise = Promise.pending();
            account.username = accountProperties.username || account.username;
            account.token = accountProperties.token || account.token;
            if (accountProperties.password) {
                account.password = hashedpassword;
            }
            if(!nopassword){
                var errors = account.validate({skip:["password"]});
            }else{
                var errors = account.validate();
            }
            if (errors) {
                promise.reject(errors);
                return promise.promise;
            }
            return account.save();
        });
    };

    var getAll = function (page) {
        return db.Account.findAndCountAll({
            offset : (page-1 || 0) * 10,
            limit : 10
        });
    };

    var getById = function (id) {
        return db.Account.find(id);
    };

    var getByUsername = function (username) {
        return db.Account.find({where: {username: username}});
    };

    var getByEmail = function (email) {
        return db.Account.find({where: {email: email}});
    };

    var countAll = function () {
        return db.Account.count();
    };

    var softDelete = function (username) {
        return getByUsername(username).then(function (account) {
            return account.destroy();
        })
    };

    return {
        update: updateAccount,
        create: createAccount,
        all: getAll,
        get: getById,
        hashPassword : hashPassword,
        checkPassword : checkPassword,
        getByUsername: getByUsername,
        count : countAll,
        getByEmail: getByEmail,
        'delete': softDelete
    }
}();

module.exports = AccountsRepo;