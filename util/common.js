'use strict';
var path = require('path');
var migration_settings = require('../scripts/migrationSettings.json');

class common {
  construct(fileReader, database) {
    this.db = database;
    this.fs = fileReader;
    this.reFileNme = /^[0-9]{10}_[a-z0-9\_]*.js$/i;
    this.exists = this.fs.existsSync || path.existsSync;
  }

  createMigrationTable(callback) {
    db.execute(migration_settings.createMigrationTable, null, {prepare: true}, function (err, response) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }

  getMigrations(callback) {
    db.execute(migration_settings.getMigration, null, {prepare: true}, function (err, alreadyRanFiles) {
      if (err) {
        return callback(err);
      }
      callback(null, alreadyRanFiles.rows);
    });
  }

  getMigrationFiles(callback) {
    let files = this.fs.readdirSync(process.cwd);
    let migFilesAvail = [];
    for (let j = 0; j < files.length; j++) {
      //filter migration files using regex.
      if (this.reFileName.test(files[j])) {
        migFilesAvail.push(files[j]);
      }
    }
    callback(false, migFilesAvail);
  }

}

module.exports = common;