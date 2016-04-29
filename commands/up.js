'use strict';
var async = require('async');
var cwd = require('cwd');
var migration_settings = require('../scripts/migrationSettings.json');

class up {
  constructor(options, pendingMigrations) {
    this.db = new require('../util/database')(options);
    this.pending = pendingMigrations;
    this.keyList = pendingMigrations.keys().sort(function (a, b) {
      return a - b;
    });
  }

  runPending() {
    return new Promise((resolve, reject) => {
      async.eachSeries(this.keyList, function (id, callback) {
        let fileName = this.pending[ id ];
        let attributes = fileName.split("_");
        let query = {
            'file': fileName, 'num': attributes[ 0 ], 'name': fileName.replace(".js", ""),
            'run': require(path.resolve(cwd + "/" + fileName))
          };
        this.run(query).then(callback(null, true), callback(err));
      }, function (err) {
        if (err) {
          reject (`Error Running Migrations: ${err}`);
        } else {
          resolve ('All Migrations Ran Successfully');
        }
      });

    });
  }

  run(query) {
    return new Promise((resolve, reject) => {
      output(`Migrating changes: ${query.name}`);
      query.run.up(this.db, function (err) {
        if (err) {
          reject(`Failed to run migration ${query.name}`);
        } else {
          db.execute(migration_settings.insertMigration, [ query.file, Date.now(), query.num, query.name ],
            { prepare: true }, function (err) {
              if (err) {
                reject(`Failed to write migration to Migrations Table: ${query.name}`);
              } else {
                resolve(`Successfully Migrated ${query.name}`);
              }
            });
        }
      });
    });
  }


}

module.exports = up;