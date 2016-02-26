'use strict';

var cassandra = require('cassandra-driver');

class Database {
    constructor(settings){
        this.driverOptions = {
            contactPoints: settings.hosts,
            keyspace: settings.keyspace
        }

        var user = settings.user;
        var password = settings.password;

        if (user && password) {
            this.driverOptions.authProvider = new cassandra.auth.PlainTextAuthProvider(user, password);
        }

        var client = new cassandra.Client(this.driverOptions);

/*        client.on('log', function (level, className, message, furtherInfo) {
            console.log('log event: %s -- %s', level, message);
        });*/

        return client;
    }
}

module.exports = Database;