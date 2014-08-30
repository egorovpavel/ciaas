var crypto = require('crypto');
module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define('Account', {
        username: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Username cant be empty"
                },
                is: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Username must be alpha"
                }
            },
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: {
                    msg: "Email must be valid email address"
                },
                notEmpty: {
                    msg: "Email cant be empty"
                }
            },
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: "Password cant be empty"
                }
            }
        }
    }, {
        paranoid: true,
        timestamps: true,
        instanceMethods: {
            gravatar: function () {
                return crypto.createHash('md5').update(this.email).digest('hex')
            }
        },
        classMethods: {
            associate: function (models) {
                Account.hasMany(models.Project);
            }
        }
    });

    return Account;
};