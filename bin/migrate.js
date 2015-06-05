var program = require("commander")
    , fs = require('fs')
    , exists = fs.existsSync || path.existsSync
    , Cassanova = require('cassanova')
    , async = require("async")
    , cwd
    , needToRun =[]
    , migration_settings = require("../scripts/migrationSettings.json")
    , batchQueries = []
    , reFileName = /^[0-9]{4}_[a-z0-9]*_\d{8}.cql$/i // regex to find migration files.
    , cqlRegex = /-{0,}\s*<cql[^>]*>([\s\S]*?)-{0,}\s*<\/cql>/gmi
    , upRegex = /-{0,}\s*<up[^>]*>([\s\S]*?)-{0,}\s*<\/up>/gmi
    , downRegex = /-{0,}\s*<down[^>]*>([\s\S]*?)-{0,}\s*<\/down>/gmi
    , migrationInsertQueries = []
    , filesRan = []
    , path = require('path');

/**
 * Usage information.
 */

var usage = [
    ''
    , '  example : '
    , ''
    , '  cassanova-migrate [options] [command]'
    , ''
    , '  cassanova-migrate -k <keyspace> -c <cql_command>. (Runs a CQL command)'
    , ''
    , '  cassanova-migrate -k <keyspace>. (Runs pending cassandra migrations)'
    , ''
    , '  cassanova-migrate -k <keyspace> -n <migration_number>. (Runs cassandra migrations UP or DOWN. Decides automatically).'
    , ''
    , '  cassanova-migrate <create>. (Creates a new cassandra migration)'
    , ''
    , '  cassanova-migrate -k <keyspace> -s'
    , ''
].join('\n');

program.on('--help', function(){
    console.log(usage);
});

program
    .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version)
    .option('-k, --keyspace "<keyspace>"', "The name of the keyspace to use.")
    .option('-c, --cql "<cqlStatement>"', "Run a single cql statement.")
    .option('-n, --num "<migrationNumber>"', "Run migrations until migration Number.")
    .option('-h, --hosts "<host,host>"', "Comma seperated host addresses. Default is [\"localhost\"].")
    .option('-p, --port "<port>"', "Defaults to cassandra default 9042.")
    .option('-s, --silent', "Hide output while executing.", false)

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

    //console.log(JSON.stringify(migFiles));

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

    var fileName = migCount + '_' + title + '_' + dateString + '.cql'

    fs.writeFileSync(process.cwd() + '/' + fileName,
        "--<up>" + "\n"+
        "    " + "--<cql>"+  "\n" +
        "    " + "    " + "Your DDL statement here."+ "\n"+
        "    " + "--</cql>"+ "\n"+
        "    " + "--<cql>"+ "\n"+
        "    " + "    " + "Your DDL statement here."+ "\n"+
        "    " + "--</cql>"+ "\n"+
        "--</up>"+ "\n"+
        "--<down>"+ "\n"+
        "    " + "--<cql>"+ "\n"+
        "    " + "    " + "Your DDL statement here."+ "\n"+
        "    " + "--</cql>"+ "\n"+
        "    " + "--<cql>"+ "\n"+
        "    " + "    " + "Your DDL statement here."+ "\n"+
        "    " + "--</cql>"+ "\n"+
        "--</down>");

    console.log("Created a new migration file with name " + fileName);
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

var prepareMigrations = function(callback){

    output("Validating Migration.");

    // If cql is passed just run the cql. Don't run migrations.
    if(program.cql){
        batchQueries.push(program.cql.toString().trim());
        return callback(null, true);
    }

    async.waterfall(
        [
            //check if program.keyspace exists in database.
            function(callback){

                var query = migration_settings.getKeyspace.replace('<keyspace_name>', program.keyspace);
                Cassanova.execute(query, function(err, response){
                    if(err){
                        return callback(err, false);
                    }
                    if(!response.length){
                        return callback("Mentioned keyspace with -k option does not exist in cassandra.");
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
                        return callback(err, false);
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
                            return callback(err);
                        }
                        // Returning empty array in migration as
                        // none of migration script is run.
                        callback(null, []);
                    });
                } else {
                    query = migration_settings.getMigration.replace('<keyspace_name>', program.keyspace);
                    Cassanova.execute(query, function(err, alreadyRanFiles){
                        if(err){
                            return callback(err);
                        }
                        callback(null, alreadyRanFiles);
                    });
                }
            },
            /**
             * This method takes alreadyRan files compares with available migrations on disk.
             * If a particular migration is already run, it ignores them otherwise
             * loads queries in batch queries.
             *
             * @param already ran files
             * @param callback
             * @returns {*}
             */
            function(alreadyRan, callback){

                // Populating already run files.
                for(var i=0; i < alreadyRan.length; i++){
                    filesRan.push(alreadyRan[i].file_name);
                }

                // Looping through migration files and
                // filtering what needs to run.
                var files = fs.readdirSync(cwd);

                var migrationsRan = [];
                //for(var j = 0 ; j < files.length; j++){
                //    if(reFileName.test(files[j]) && files[j].indexOf(filesRan[j]) === -1){
                //        needToRun.push(files[j]);
                //        migrationsRan.push(files[j].substr(0,4));
                //    }
                //}
                for(var j = 0 ; j < files.length; j++){
                    if(reFileName.test(files[j])){
                        if(files[j].indexOf(filesRan[j]) === -1){
                            needToRun.push(files[j]);
                        }
                        
                        migrationsRan.push(files[j].substr(0,4));
                    }
                }
                //Todo : should I do -n calc here

                if(program.num){
                    // todo Calculate what is already run migrationsRan
                    // todo what needs to be run 
                    //
                }

                // Return if there are no migration to run.
                if(!needToRun.length){
                    return callback('No incremental upgrades to run at this time.');
                }

                // Building queries to update
                // table sys_cassanova_migrations
                // todo : Need to change so that when -n is passed
                // todo : it can delete or add conditionally.
                var upResult;
                for(var k = 0; k < needToRun.length ; k++){
                    var attributes = needToRun[k].split("_"),
                        title = attributes[1],
                        migration_number = attributes[0] ;

                    migrationInsertQueries.push(
                        migration_settings.insertMigration
                        .replace('<keyspace_name>', program.keyspace)
                        .replace('<file_name>', path.basename(needToRun[k]))
                        .replace('<created_at>', Date.now())
                        .replace('<migration_number>', migration_number)
                        .replace('<title>', title)
                    );

                    // Reading file.
                    var file = fs.readFileSync(path.resolve(cwd + "/" + needToRun[k]));

                    // Populating UP queries in case of no -n option.
                    if(!program.num) {
                        while ((upResult = upRegex.exec(file)) !== null) {
                            var result;
                            while ((result = cqlRegex.exec(upResult[1])) !== null) {
                                batchQueries.push(result[1].replace(/\s+/g, ' ').trim());
                            }
                        }
                    } else{
                        //todo
                    }
                }

                //console.log('batchQueries : \n' + JSON.stringify(batchQueries, null, 2));
                //console.log('migrationInsertQueries :\n' + JSON.stringify(migrationInsertQueries, null, 2));
                batchQueries.splice.apply(batchQueries, [batchQueries.length, 0].concat(migrationInsertQueries));
                //console.log('batchQueries : \n' + JSON.stringify(batchQueries, null, 2));
                callback(null, false);
            }
        ],
        function(err, res){
            if(err){
                if(err){
                    callback(err);
                }
            }

            callback(null, true);
        }
    );
};

/**
 * Initializes the query batch to execute.
 * @param  {Function} callback Callback to async with error or success
 */
var runQueries = function(callback){

    output("Initializing queries...");


    if(!program.cql) {
        console.log("Applying incremental upgrades.");
    }
    // setting up Keyspace for cql and files.
    batchQueries.unshift("USE " + program.keyspace + ";");

    if(batchQueries && batchQueries.length > 0){
        output("Running queries...");
        executeQuery(batchQueries.shift(), callback);
    }else{
        callback("No queries to run.", null);
    }
};

/**
 * A recursive method, that executes each query.
 * @param  {String} eQuery The cql string to be executed.
 * @param  {Function} callback Callback to async with error or success
 */
var executeQuery = function(eQuery, callback){

    output("Executing:\t\t" + eQuery);

    Cassanova.execute(eQuery, function(err) {
        if (err){
            return callback(err, null);
        } else {
            if(batchQueries.length > 0){
                executeQuery(batchQueries.shift(), callback);
            }else{
                callback(null, true);

                process.nextTick(function(){
                    process.exit(1);
                });
            }
        }
    });
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
    //opts.username = process.env.CASS_USER || config.db.username;
    //opts.password = process.env.CASS_PASS || config.db.password;
    opts.hosts = program.hosts ? program.hosts : ["localhost"];
    opts.port = program.port ? program.port : 9042;

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

output("Initializing Migration...");

/**
 * Verifies the arguments are valid and have required arguments.
 * @param  {Function} callback Callback to async with error or success.
 */
var processArguments = function(callback){
    output("Processing arguments...");

    if((!program.keyspace || program.keyspace.length === 0)){
        return callback("A keyspace has not been defined. Use -k option to define keyspace (check --help for more details).");
    }
    program.hosts = !program.hosts ? program.hosts : program.hosts.split(",");
    if((program.hosts && program.hosts.length === 0) || (program.hosts && !(program.hosts instanceof Array))){
        return callback("An invalid host is defined. Use --help to check proper usage.");
    }

    cwd = program.args[0] ? program.args[0] : process.cwd();

    if(!exists(cwd)){
        return callback("The path " + cwd + " can't be resolved");
    }

    // loading cql scripts

    callback(null, true);
};

async.series(
    [
        function(callback){
            debugger;
            processArguments(callback);
        },
        function(callback){
            startCassanova(callback);
        },
        function(callback){
            prepareMigrations(callback);
        },
        function(callback){
            runQueries(callback);
        }
    ],
    function(err, callback){
        if(err){
            console.log(err);
            process.exit(1);
        }else{
            output("Migration Complete!");
            process.exit(0);
        }
    }
);