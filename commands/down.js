'use strict';

class down {
  constructor (options) {
    this.db = new require('../util/database')(options);
  }

  runPrevious(){
    return new Promise((resolve, reject)=>{

    });
  }

  runAll(){
    return new Promise((resolve, reject)=>{

    });
  }
}

module.exports = down;