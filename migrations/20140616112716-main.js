db = require('../models');

module.exports = {
    up: function (migration, DataTypes, done) {
        db.sequelize.sync({force: true}).success(function (err) {
            if (err) {
                console.log(err);
            }
            done();
        });
    },
    down: function (migration, DataTypes, done) {
        migration.dropAllTables().complete(done)
    }
};
