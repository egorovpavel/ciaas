module.exports = {
  up: function(migration, DataTypes, done) {
      migration.addColumn('Containers','command',{type:DataTypes.STRING,defaultValue:""}).then(function(){
          return migration.addColumn('Containers','defaultAlias',{type:DataTypes.STRING,defaultValue:""});
      }).then(function(){
          return migration.addColumn('Containers','displayName',{type:DataTypes.STRING,defaultValue:""});
      }).then(function(){
          return migration.addColumn('Containers','icon',{type:DataTypes.STRING,defaultValue:""});
      }).then(function(){
          done();
      });
  },
  down: function(migration, DataTypes, done) {
      migration.removeColumn('Containers', 'command').then(function(){
          return migration.removeColumn('Containers', 'defaultAlias');
      }).then(function(){
          return migration.removeColumn('Containers', 'displayName');
      }).then(function(){
          return migration.removeColumn('Containers', 'icon');
      }).then(function(){
          done();
      })
  }
};
