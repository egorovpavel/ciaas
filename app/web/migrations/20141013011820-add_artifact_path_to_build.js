module.exports = {
  up: function(migration, DataTypes, done) {
      migration.addColumn('Builds','artifact_path',{type:DataTypes.STRING,defaultValue:""}).then(function(){
          done();
      });
  },
  down: function(migration, DataTypes, done) {
      migration.removeColumn('Projects', 'artifact_path').then(function(){
          done();
      })
  }
};
