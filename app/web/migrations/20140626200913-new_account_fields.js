module.exports = {
    up: function (migration, DataTypes, done) {
        migration.addColumn(
            'Accounts',
            'provider',
            DataTypes.ENUM('github')
        ).then(function () {
            return migration.removeColumn('Accounts', 'full_name');
        }).then(function () {

        }).finally(function () {
            done();
        });

    },
    down: function (migration, DataTypes, done) {
        // add reverting commands here, calling 'done' when finished
        done()
    }
}
