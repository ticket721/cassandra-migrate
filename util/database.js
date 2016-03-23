'use strict';

var cassandra = require('cassandra-driver');

class Database {
  constructor(settings) {
    this.driverOptions = {
      contactPoints: settings.hosts || [ "localhost" ],
      keyspace: settings.keyspace
    }

    var username = settings.username;
    var password = settings.password;

    if (username && password) {
      this.driverOptions.authProvider = new cassandra.auth.PlainTextAuthProvider(username, password);
    }

    var client = new cassandra.Client(this.driverOptions);

    /*        client.on('log', function (level, className, message, furtherInfo) {
     console.log('log event: %s -- %s', level, message);
     });*/

    return client;
  }
}

module.exports = Database;