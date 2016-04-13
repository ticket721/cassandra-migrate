'use strict';
var path = require('path'),
  fs = require('fs'),
  migration_settings = require('../scripts/migrationSettings.json');

class common {
  construct(options) {
    this.db = new require('../util/database')(options);
    this.fs = fs.FileReader();
    this.reFileName = /^[0-9]{10}_[a-z0-9\_]*.js$/i;
    this.exists = this.fs.existsSync || path.existsSync;
    this.runMigrations = this.getMigrations();
    this.availableMigrations = this.getMigrationFiles();
  }

  createMigrationTable() {
    return new Promise((resolve, reject) => {
      db.execute(migration_settings.createMigrationTable, null, {prepare: true}, function (err, response) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  getMigrations() {
    return new Promise((resolve, reject) => {
      db.execute(migration_settings.getMigration, null, {prepare: true}, function (err, alreadyRanFiles) {
        if (err) {
          reject(err);
        }
        resolve(alreadyRanFiles.rows);
      });
    });
  }

  getMigrationFiles() {
    return new Promise((resolve, reject) => {
      let files = this.fs.readdirSync(process.cwd);
      let migFilesAvail = [];
      for (let j = 0; j < files.length; j++) {
        //filter migration files using regex.
        if (this.reFileName.test(files[j])) {
          migFilesAvail.push(files[j]);
        }
      }
      resolve(migFilesAvail);
    });
  }

  getPendingMigrations(){
    return new Promise((resolve, reject) => {

    });
  }

  getMigrationSet(n, direction){
    return new Promise((resolve, reject) => {
      if(direction == 'up'){
        var migNums = {};
        
      }else if (direction =='down'){
        //if n is in already ran migrations && available files
      }else{
        reject('Migration direction must be specified')
      }
    });
  }
  

}

module.exports = common;