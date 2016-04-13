'use strict';

class up {
  constructor (options, migrationList){
    this.db = new require('../util/database')(options);
    this.run = migrationList.migrations;
    this.pending = migrationList.files;
  }

  run(){
    return new Promise ((resolve, reject) => {
      output(`Migrating changes: ${query.name}`);
      query.run.up(db, function (err) {
        if (err) {
          return callback(err, null);
        } else {
          db.execute(migration_settings.insertMigration, [ query.file, Date.now(), query.num, query.name ],
            { prepare: true }, function (err) {
              if (err) {
                return callback(err, null);
              } else {
                if (upQueries.length > 0) {
                  up(upQueries.shift(), callback);
                } else {
                  callback(null, true);
                  process.nextTick(function () {
                    process.exit(1);
                  });
                }
              }
            });
        }
      });
    });
  }
  
  runUntil(n){
    return new Promise ((resolve, reject) => {

    });
  }

  runAll(){
    return new Promise ((resolve, reject) => {

    });
  }

  getUpQueriesUntilMigration() {
    var migrationFrom = migApplied.length,
      migrationTo;

    //If desired todo
    if (desiredMigration && (migAvail.indexOf(desiredMigration) + 1) < migAvail.length) {
      migrationTo = migAvail.indexOf(desiredMigration) + 1;
    } else {
      migrationTo = migAvail.length;
    }

    for (var k = migrationFrom; k < migrationTo; k++) {
      var fileName = migFilesAvail[ migAvail.indexOf(migAvail[ k ]) ],
        attributes = fileName.split("_"),
        query = {
          'file': fileName, 'num': attributes[ 0 ], 'name': fileName.replace(".js", ""),
          'run': require(path.resolve(cwd + "/" + fileName))
        };
      upQueries.push(query);

    }
  }

}

module.exports = up;