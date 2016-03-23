#!/usr/bin/env node
/*jslint node: true */
"use strict";

var program = require('commander'),
fs = require('fs'),
  cwd;

/**
 * Usage information.
 */

var usage = [
  '',
  '  example : ',
  '',
  '  cassandra-migrate [options] [command]',
  '',
  '  cassandra-migrate -k <keyspace> -c <cql_command>. (Runs a CQL command)',
  '',
  '  cassandra-migrate -k <keyspace>. (Runs pending cassandra migrations)',
  '',
  '  cassandra-migrate -k <keyspace> -n <migration_number>. (Runs cassandra migrations UP or DOWN. Decides automatically).',
  '',
  '  cassandra-migrate <create>. (Creates a new cassandra migration)',
  '',
  '  cassandra-migrate -k <keyspace> -s',
  '',
  '  cassandra-migrate <create> -t <template> (Creates a new cassandra migrate but uses a specified template instead of default).',
  '',

].join('\n');

program.on('--help', function () {
  console.log(usage);
});

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
  .option('-k, --keyspace "<keyspace>"', "The name of the keyspace to use.")
  .option('-h, --hosts "<host,host>"', "Comma seperated host addresses. Default is [\"localhost\"].")
  //.option('-p, --port "<port>"', "Defaults to cassandra default 9042.")
  .option('-s, --silent', "Hide output while executing.", false)
  .option('-u, --username "<username>"', "database username")
  .option('-p, --password "<password>"', "database password")
  ;

program.name = 'cassandra-migrate';

// init command

/**
 * A method to create incremental new migrations
 * on create migration command.
 * e.g. cassandra-migration create
 * @param path
 */


program
  .command('create <title>')
  .description('initialize a new migration file with title.')
  .option('-t, --template "<template>"', "sets the template for create")
  .action(function (title, options){
    var Create = new require('../commands/create')(options.template);
    Create.newMigration(title);
    process.exit(0);
  });

program
  .command('up')
  .description('run pending migrations')
  .option('-a, --all', 'run all pending migrations', true)
  .option('-n, --num "<number>"','run migrations up to a specified migration number')
  .action(function(options){
    var Up = new require('../commands/up')(options);
    if(options.all){
      Up.runAll();
    }else{
      Up.runNext();
    }
    process.exit(0)
  });

program
  .command('down')
  .description('roll back already run migrations')
  .option('-a, --all', 'rollback all migrations', true)
  .option('-n, --num "<number>"','rollback migrations down to a specified migration number')
  .action(function(options){
    var Down = new require('../commands/down')(options);
    if(options.all){
      Down.runAll();
    }else{
      Down.runPrevious();
    }
    process.exit(0);
  });

program
  .command('run')
  .description('run cql directly')
  .option('-f, --files', 'run cql commands from file', true)
  .action(function(options){
    var Run = new require('../commands/run')(options);
    Run.cql();
    process.exit(0);
  });

program.parse(process.argv);

