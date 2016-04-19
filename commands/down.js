'use strict';
var async = require('async');
var cwd = require('cwd');

class down {
  constructor(options, pendingMigrations) {
    this.db = new require('../util/database')(options);
    this.pending = pendingMigrations;
    this.keyList = pendingMigrations.keys().sort(function (a, b) {
      return b - a;
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
        this.run(query).then(callback(null, true));
      }, function (err) {
        if (err) {
          reject(`Error Rolling Back Migrations: ${err}`);
        } else {
          resolve('All Migrations Rolled Back Successfully');
        }
      });

    });
  }

  run(query) {
    return new Promise((resolve, reject) => {
      output(`Rolling back changes: ${query.name}`);
      query.run.down(db, function (err) {
        if (err) {
          reject(err);
        } else {
          db.execute(migration_settings.deleteMigration, [ query.file ],
            { prepare: true }, function (err) {
              if (err) {
                reject (err);
              } else {
                resolve(`Successfully Rolled Back ${query.name}`);
              }
            });
        }
      });
    });
  }

}

module.exports = down;