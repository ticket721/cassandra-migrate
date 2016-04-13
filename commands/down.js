'use strict';

class down {
  constructor (options, migrationList) {
    this.db = new require('../util/database')(options);
    this.run = migrationList.migrations;
    this.pending = migrationList.files;
  }

  runPrevious(){
    return new Promise((resolve, reject)=>{

    });
  }

  runUntil(n){
    return new Promise((resolve, reject)=>{

    });
  }

  runAll(){
    return new Promise((resolve, reject)=>{

    });
  }

  revertMigration() {
  // Work backwards, down migrate until them desiredMigration.down is applied
  var lastIndex = migApplied.length - 1;
  for (var i = lastIndex; i >= migApplied.indexOf(desiredMigration) && i >= 0; i--) {
    var fileName = migFilesAvail[ migAvail.indexOf(migApplied[i]) ];
    var attributes = fileName.split(/\_/);
    var query = {
      'file': fileName, 'num': attributes[ 0 ], 'name': fileName.replace(".js", ""),
      run: require(path.resolve(cwd + "/" + fileName))
    };

    downQueries.push(query);
  }
}
}

module.exports = down;