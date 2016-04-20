'use strict';
var path = require('path'),
  fs = require('fs'),
  migration_settings = require('../scripts/migrationSettings.json');

class common {
  var self = this;
  construct(options) {
    this.db = new require('../util/database')(options);
    this.fs = fs.FileReader();
    this.reFileName = /^[0-9]{10}_[a-z0-9\_]*.js$/i;
    this.exists = this.fs.existsSync || path.existsSync;
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
        }else{
          let filesRan = {};
          for (let i = 0; i < alreadyRanFiles.rows.length; i++) {
            filesRan[alreadyRanFiles.migration_number] = (alreadyRanFiles.rows[ i ].file_name);
          }
          self.filesRan = filesRan;
          resolve(filesRan);
        }
      });
    });
  }

  getMigrationFiles() {
    return new Promise((resolve, reject) => {
      let files = this.fs.readdirSync(process.cwd);
      let filesAvail = {};
      for (let j = 0; j < files.length; j++) {
        //filter migration files using regex.
        if (this.reFileName.test(files[j])) {
          filesAvail[files[ j ].substr(0,10)] = files[j];
        }
      }
      self.filesAvail = filesAvail;
      resolve(filesAvail);
    });
  }

  static difference(obj1, obj2){
    for (let key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        if(obj2[key] && obj2[key].length){
          delete obj2[key];
        }
      }
    }
    return obj2;
  }

  getMigrationSet(direction, n){
    return new Promise((resolve, reject) => {
      let pending;
      if(direction == 'up'){
        pending = difference(self.filesRan, self.migFilesAvail);
        for(let key in pending){
          if(pending[n]) {
            if (pending.hasOwnProperty(key) && key > n) {
              delete pending[key];
            }
          }else{
            reject(`migration number ${n} not found in pending migrations`)
          }
        }
      }else if (direction =='down'){
        pending = self.filesRan;
        for(let key in pending){
          if(pending[n]){
            if(pending.hasOwnProperty(key) && key < n) {
              delete pending [key];
            }
          }else{
            reject(`migration number ${n} not found in pending migrations`)
          }
        }
      }else{
        reject('Migration direction must be specified')
      }
      resolve(pending);
    });
  }
  

}

module.exports = common;