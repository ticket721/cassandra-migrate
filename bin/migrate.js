var program = require("commander")
    , fs = require('fs')
    , config = require('config')//todo : this seem to work directly from parent config.
    , exists = fs.existsSync || path.existsSync
    , Cassanova = require('cassanova')
    , async = require("async")
    , cwd
    , migrationFiles
    , migration_settings = require("../scripts/migrationSettings.json")
    , batchQueries = []
    , filesRan;

/**
 * Usage information.
 */

var usage = [
    ''
    , '  example : '
    , ''
    , '  cassandra-migrate [options] [command]'
    , ''
    , '  cassandra-migrate -k <keyspace> -c <cql_command>. (Runs a CQL command)'
    , ''
    , '  cassandra-migrate -k <keyspace>. (Runs pending cassandra migrations)'
    , ''
    , '  cassandra-migrate -k <keyspace> -n <migration_number>. (Runs cassandra migrations UP or DOWN. Decides automatically).'
    , ''
    , '  cassandra-migrate <create>. (Creates a new cassandra migration)'
    , ''
    , '  cassandra-migrate -k <keyspace> -s'
    , ''
].join('\n');

program.on('--help', function(){
    console.log(usage);
});

program
    .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
    .option('-k, --keyspace "<keyspace>"', "The name of the keyspace to use.")
    .option('-c, --cql "<cqlStatement>"', "Run a single cql statement.")
    .option('-s, --silent', "Hide output while executing.", false)
    .option('--production', "Overrides prevention of running against production. Don't do this unless you really, REALLY, mean it.", false)

program.name = 'cassanova-migrate';

// init command

/**
 * A method to create incremental new migrations
 * on create migration command.
 * e.g. cassanova-migration create
 * @param path
 */

var createMigration = function(title){

    var files = fs.readdirSync(process.cwd()),
        migFiles = [],
        count,
    // regex to find migration files.
        reFileName = /^[0-9]{4}_[a-z0-9]*_\d{8}.js$/i,
        reTitle = /^[a-z0-9]*$/i;

    if(!reTitle.test(title)){
        console.log('Invalid title. Only alphanumeric title is accepted.');
        process.exit(1);
    }

    for(var i = 0 ; i < files.length; i++){
        if(reFileName.test(files[i])){
            migFiles.push(Number(files[i].substr(0,4)));
        }
    }


    console.log(JSON.stringify(migFiles));

    if(!migFiles.length){
        count = 1;
    }else {
        migFiles.sort(function(a,b){
            if(a > b){
                return 1;
            }
            if(a < b){
                return -1;
            }
            // a must be equal to b
            return 0;
        });
        count = (migFiles[migFiles.length - 1]) + 1;
    }


    var migCount = (function(str, padString, length) {
        while (str.length < length)
            str = padString + str;
        return str;
    })(count.toString(), '0', 4);

    var dateString = (function(d) {
        var yyyy = d.getFullYear().toString();
        var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = d.getDate().toString();
        return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
    })(new Date());

    var fileName = migCount + '_' + title + '_' + dateString + '.js'
    console.log(fileName);

    fs.writeFileSync(process.cwd() + '/' + fileName, '//test Cassandra migrations');

    process.exit(0);

};

program
    .command('create <title>')
    .description('initialize a new migration file with title.')
    .action(createMigration);

program.parse(process.argv);

/**
 * A method to check if sys_migration table is created,
 * if created what all scripts have already run.
 * @param callback
 */

var validateMigrations = function(callback){

    output("Validating Migration.");

    // If cql is passed just run the cql. Don't run migrations.
    if(program.cql){
        return callback(null, true);
    }

    async.waterfall(
        [
            //check if program.keyspace exists in database.
            function(callback){

                var query = migration_settings.getKeyspace.replace('<keyspace_name>', program.keyspace);
                Cassanova.execute(query, function(err, response){
                    if(err){
                        callback(err, false);
                    }
                    if(!response.length){
                        callback("Mentioned keyspace with -k option does not exist");
                    }
                    callback(null);
                });
            },
            //check if migration table exists.
            function(callback){
                //Check if migration table exists in defined (-k) keyspace.
                var query = migration_settings.getColumnFamily.replace('<keyspace_name>', program.keyspace);
                Cassanova.execute(query, function(err, response){
                    if(err){
                        callback(err, false);
                    }
                    callback(null, response.length ? true: false);
                });
            },
            function(migrationExists, callback){
                // Create migration table if doesn't exist.
                // return data otherwise.
                if(!migrationExists){
                    var query = migration_settings.createMigrationTable.replace('<keyspace_name>', program.keyspace);
                    Cassanova.execute(query, function(err, response){
                        if(err){
                            callback(err);
                        }
                        // Returning empty array in migration as
                        // none of migration script is run.
                        callback(null, []);
                    });
                } else {
                    query = migration_settings.getMigration.replace('<keyspace_name>', program.keyspace);
                    Cassanova.execute(query, function(err, response){
                        if(err){
                            callback(err);
                        }
                        callback(null, response);
                    });
                }
            }
        ],
        function(err, res){
            if(err){
                callback(err);
            }

            for(var i=0; i < res.length; i++){
                filesRan.push(res[i].file_path);
            }

            migrationInsertQuery = migration_settings.insertMigration.replace('<keyspace_name>', program.keyspace);
            callback(null, true);
        }
    );
};

var processMigrationFile = function(filePath, callback){
    var data,
        extension,
        k;

    data = require(filePath);
    for(k=0; k < data.length; k++){
        filePath = data[k].file;
        extension = path.extname(filePath).toLowerCase();
        if(fs.existsSync(filePath)){
            if(extension === ".json"){
                processMigrationFile(filePath, callback);
            }else if(extension === ".cql"){
                // Add file only if it not already run.
                if(filesRan.indexOf(path.basename(filePath)) === -1){
                    // Convert into a array of Object so can keep track by name.
                    file = fs.readFileSync(filePath);
                    files.push(file);
                    migrationBatch.push(
                        migrationInsertQuery
                            .replace('<file_path>', path.basename(data[k].file))
                            .replace('<name>', data[k].name)
                            .replace('<created_at>', Date.now())
                            .replace('<description>', data[k].description)
                    );
                }
            }
        }else{
            return callback("File does not exist, " + filePath, false);
        }
    }
};

/**
 * Starts Cassanova.
 * @param  {Function} callback Callback to async with error or success
 */
var startCassanova = function(callback){
    var opts = {};

    output("Connecting to database...");
    //We need to be able to do anything with any keyspace. We just need a db connection. Just send
    //in the hosts, username and password, stripping the keyspace.
    opts.username = process.env.CASS_USER || config.db.username;
    opts.password = process.env.CASS_PASS || config.db.password;
    opts.hosts = config.db.hosts;
    opts.port = config.db.port;

    Cassanova.connect(opts, function(err, result){
        if(err){
            //err.username = opts.username;
            //err.password = opts.password;
            err.hosts = opts.hosts;
        }
        callback(err, result);
    });
};

/**
 * Output messages to console if not running silent.
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
var output = function(msg){
    if(!program.silent){
        console.log(msg);
    }
}

output("Initializing CQL Runner...");

/**
 * Verifies the arguments are valid and have required arguments.
 * @param  {Function} callback Callback to async with error or success.
 */
var processArguments = function(callback){

    output("Processing arguments...");

    if((!program.keyspace || program.keyspace.length === 0)){
        return callback("A keyspace has not been defined. Use -k option to define keyspace (check --help for more details).");
    }

    // if program.cql is defined just run the cql.
    if(program.cql){
        batchQueries.push(program.cql.toString().trim());
        return callback(null, true);
    }

    cwd = program.args[0] ? program.args[0] : process.cwd();

    if(!exists(cwd)){
        return callback("The path " + cwd + " can't be resolved");
    }

    if(!program.cql){
        migrationFiles = fs.readDirSync(cwd);
    }

    callback(null, true);
};

async.series(
    [
        function(callback){
            processArguments(callback);
        },
        function(callback){
            startCassanova(callback);
        },
        function(callback){
            validateMigrations(callback)
        },
        function(callback){
            runScripts(callback)
        }
    ],
    function(err, callback){
        if(err){
            console.log(err);
            process.exit(1);
        }else{
            output("CQL Runner Complete!");
            process.exit(0);
        }
    }
);