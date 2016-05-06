'use strict';

var cassandra = require('cassandra-driver');

class Database {
  constructor(settings) {

    this.driverOptions = {
      contactPoints: settings.hosts || process.env.DBHOST || [ "localhost" ],
      keyspace: settings.keyspace || process.env.DBKEYSPACE
    };
    
    var username = settings.username || process.env.DBUSER;
    var password = settings.password || process.env.DBPASSWORD;

    if (username && password) {
      this.driverOptions.authProvider = new cassandra.auth.PlainTextAuthProvider(username, password);
    }

    var client = new cassandra.Client(this.driverOptions);

    return client;
  }
}

module.exports = Database;