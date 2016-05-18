# Cassandra-migrate

Cassandra-migrate is a incremental migration tool for Cassandra.

## Version 1.1.2 update
the format of the migration table has changed, to facilitate the change over I've included an example migration file (0000000000_updateMigrationTable.js)
that should nondestructivly update the migration table to the new format, just copy it into your migrations folder and run it before running any other migrations

## Features
- Uses the node cassandra-driver  to run incremental migrations on Cassandra database.
- Uses Cassandra keyspace mentioned in commandline to keep track of ran migrations.
- Automatically builds and run UP or DOWN until any migration number.
- Creates a new incremental migration template by a single command. 


## Installation

Install [node.js](http://nodejs.org/) and [cassandra](http://cassandra.apache.org/) and [cassandra-driver](https://www.npmjs.com/package/cassandra-driver). Then:

```
npm install cassandra-migrate
```

## Overview

### Basic Usage

Creates a new migration with a timestamped migration number ( Used for tracking migrations ).

```
    cassandra-migrate create <title>
```

Runs all migrations available in current directory.

```
    cassandra-migrate up -k <keyspace>
```

Rolls back all migrations in the migrations table.

```
    cassandra-migrate down -k <keyspace>
```


Goes back/forward to a particular migration automatically.

```
    cassandra-migrate <up/down> -k <keyspace> -n <migration-number>
```

Skips a particular migration (either adds or removes the migration from the table without running any scripts.

```
    cassandra-migrate <up/down> -k <keyspace> -s <migration-number>
```

Define host, username, and password. By default connects to [localhost] and default cassandra port [9042].

```
    cassandra-migrate -h [10.10.10.1] -u username -p password
```

Cassandra connection details can also be specified in environmental variables
```
    DBHOST : sets hostname
    DBKEYSPACE : sets keyspace
    DBUSER : sets username
    DBPASSWORD : sets password;
```

More help.

```
    cassandra-migrate --help
```

## License

cassandra-migrate is distributed under the [MIT license](http://opensource.org/licenses/MIT).

## Contributions

Feel free to join in and support the project!

Check the [Issue tracker](https://github.com/rleenders/cassandra-migrate/issues)
