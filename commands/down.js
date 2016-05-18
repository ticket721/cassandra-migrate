'use strict';
var async = require('async');
var migration_settings = require('../scripts/migrationSettings.json');
var path = require('path');

class down {
  constructor(db, pendingMigrations) {
    this.db = db;
    this.pending = pendingMigrations;
    this.keyList = Object.keys(pendingMigrations).sort(function (a, b) {
      return b - a;
    });
  }

  runPending(skip) {
    return new Promise((resolve, reject) => {
      async.eachSeries(this.keyList, (id, callback) => {
        let fileName = this.pending[ id ];
        let attributes = fileName.split("_");
        let query = {
          'file': fileName, 'num': attributes[ 0 ], 'name': fileName.replace(".js", ""),
          'run': require(path.resolve(process.cwd() + "/" + fileName))
        };
        if(skip){
          if(skip == query.num){
            this.updateMigrationTable(query)
              .then((result) => callback(null, result))
              .catch((error) => callback(error));
          }
        }else{
          this.run(query)
            .then((query) => this.updateMigrationTable(query))
            .then((result) => callback(null, result))
            .catch((error) => callback(error));
        }
      }, (err) => {
        if (err) {
          reject (`Error Rolling Back Migrations: ${err}`);
        } else {
          resolve ('All Migrations Rolled Back Successfully');
        }
      });

    });
  }

  run(query) {
    return new Promise((resolve, reject) => {
      console.log(`Rolling back changes: ${query.name}`);
      let db = this.db;
      query.run.down(db, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(query);
        }
      });
    });
  }

  updateMigrationTable(query){
    return new Promise((resolve, reject) => {
      let db = this.db;
      db.execute(migration_settings.deleteMigration, [ query.file ],
        { prepare: true }, function (err) {
          if (err) {
            reject (err);
          } else {
            resolve(`Successfully Rolled Back ${query.name}`);
          }
        });
    })
  }

}

module.exports = down;