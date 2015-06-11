# Cassanova-migrate

Cassanova-migrate is a incremental migration tool for Cassandra.

## Features
- Uses Cassanova to run incremental migrations on Cassandra database.
- Uses Cassandra keyspace mentioned in commandline to keep track of ran migrations.
- Automatically builds and run UP or DOWN until any migration number.
- Creates a new incremental migration template by a single command. 


## Installation

Install [node.js](http://nodejs.org/) and [cassandra](http://cassandra.apache.org/) and [cassanova](https://www.npmjs.com/package/cassanova). Then:

```
npm install cassanova-migrate
```

```
cd cassanova-migrate
```

```
npm install
```

## Overview

### Basic Usage

Runs all migrations available in current directory.

```
    cassanova-migrate -k <keyspace>
```

Creates a new migration with incremental migration number ( Used for tracking migrations ).

```
    cassanova-migrate create <title>
```

Goes back/forward to a particular migration automatically.

```
    cassanova-migrate -k <keyspace> -n <migration-number>
```

Runs a cql command.

```
    cassanova-migrate -k <keyspace> -c "<cql-script>"
```

Runs a cql command.

```
    cassanova-migrate -k <keyspace> -c "<cql-script>"
```

Define host and port number. By default connects to [localhost] and default cassandra port [9042].

```
    cassanova-migrate -h [10.10.10.1] -p 9252"
```

More help.

```
    cassanova-migrate --help"
```

## License

cassanova-migrate is distributed under the [MIT license](http://opensource.org/licenses/MIT).

## Contributions

Feel free to join in and support the project!

Check the [Issue tracker](https://github.com/keswanikaran/cassanova-migrate/issues)