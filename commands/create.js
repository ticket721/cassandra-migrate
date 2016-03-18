
/**
 * A method to create incremental new migrations
 * on create migration command.
 * e.g. cassandra-migration create
 * @param path
 */

var createMigration = function (title) {

    var files = fs.readdirSync(process.cwd()),
        migFiles = [],
        count,
        reTitle = /^[a-z0-9\_]*$/i;

    if (!reTitle.test(title)) {
        console.log("Invalid title. Only alphanumeric and '_' title is accepted.");
        process.exit(1);
    }

    var dateString = Math.floor(Date.now() / 1000) + '';

    var fileName = dateString + '_' + title + '.js';

    var template = `
    var migration${dateString} = {
      up : function (db, handler) {
          var query = '';
          var params = [];
          db.execute(query, params, { prepare: true }, function (err) {
              if (err) {
                  handler(err, false);
              } else {
                  handler(false, true);
              }
          });
      },
      down : function (db, handler) {
          var query = '';
          var params = [];
          db.execute(query, params, { prepare: true }, function (err) {
              if (err) {
                  handler(err, false);
              } else {
                  handler(false, true);
              }
          });
      }
    };
    module.exports = migration${dateString};`;

    if (program.template) {
        template = fs.readFileSync(program.template);
    }

    fs.writeFileSync(`${process.cwd()}/${fileName}`, template);
    console.log("Created a new migration file with name " + fileName);
    process.exit(0);

};
