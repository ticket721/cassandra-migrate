#!/usr/bin/env node
/*jslint node: true */
"use strict";

var program = require('commander');
var Common = require('./util/common');
var fs = require('fs');
var DB = require('./util/database');

/**
 * Usage information.
 */

// var usage = [
//   '',
//   '  example : ',
//   '',
//   '  cassandra-migrate [options] [command]',
//   '',
//   '  cassandra-migrate -k <keyspace> -c <cql_command>. (Runs a CQL command)',
//   '',
//   '  cassandra-migrate -k <keyspace>. (Runs pending cassandra migrations)',
//   '',
//   '  cassandra-migrate -k <keyspace> -n <migration_number>. (Runs cassandra migrations UP or DOWN. Decides automatically).',
//   '',
//   '  cassandra-migrate <create>. (Creates a new cassandra migration)',
//   '',
//   '  cassandra-migrate -k <keyspace> -s',
//   '',
//   '  cassandra-migrate <create> -t <template> (Creates a new cassandra migrate but uses a specified template instead of default).',
//   '',
//
// ].join('\n');
//
// program.on('--help', function () {
//   console.log(usage);
// });

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version)
  .option('-k, --keyspace "<keyspace>"', "The name of the keyspace to use.")
  .option('-h, --hosts "<host,host>"', "Comma seperated host addresses. Default is [\"localhost\"].")
  //.option('-p, --port "<port>"', "Defaults to cassandra default 9042.")
  .option('-s, --silent', "Hide output while executing.", false)
  .option('-u, --username "<username>"', "database username")
  .option('-p, --password "<password>"', "database password")
;

program.name = 'cassandra-migrate';


program
  .command('create <title>')
  .description('initialize a new migration file with title.')
  .option('-t, --template "<template>"', "sets the template for create")
  .action(function (title, options) {
    let Create = require('./commands/create');
    let create = new Create(fs, options.template);
    create.newMigration(title);
    process.exit(0);
  });

program
  .command('up')
  .description('run pending migrations')
  .option('-n, --num "<number>"', 'run migrations up to a specified migration number')
  .action((options) => {
    let db = new DB(program);
    var common = new Common(fs,db);
    common.createMigrationTable()
      .then(common.getMigrationFiles(process.cwd()))
      .then(() => common.getMigrations())
      .then(() => common.getMigrationSet('up', options.num))
      .then((migrationLists) => {
        let Up = require('./commands/up');
        let up = new Up(db, migrationLists);
        console.log('processing migration lists');
        up.runPending()
          .then(result => {
            console.log(result);
            process.exit(0);
          }, error => {
            console.log(error);
            process.exit(1);
          });
      })
      .catch(error => {
        console.log(error);
        process.exit(1);
      });

  });

program
  .command('down')
  .description('roll back already run migrations')
  .option('-n, --num "<number>"', 'rollback migrations down to a specified migration number')
  .action((options) => {
    console.log('in action down');
    let db = new DB(program);
    var common = new Common(fs,db);
    common.createMigrationTable()
      .then(common.getMigrationFiles(process.cwd()))
      .then(() => common.getMigrations())
      .then(() => common.getMigrationSet('down', options.num))
      .then((migrationLists) => {
        console.log('processing migration lists');
        let Down = require('./commands/down');
        let down = new Down(db, migrationLists);
        down.runPending()
          .then(result => {
            console.log(result);
            process.exit(0);
          }, error => {
            console.log(error);
            process.exit(1);
          });
      })
      .catch(error => {
        console.log(error);
        process.exit(1);
      });
  });
/*
 //@TODO: add this functionality  so that a cql client isn't directly required
 program
 .command('run')
 .description('run cql directly')
 .option('-f, --files', 'run cql commands from file', true)
 .action(function(options){
 var Run = new require('../commands/run')(options);
 Run.cql();
 process.exit(0);
 });
 */
program.parse(process.argv);

