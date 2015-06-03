
exports.up = function(){
    return [
        {
           query : "CREATE TABLE IF NOT EXISTS users (" +
                "userid TIMEUUID," +
            "email TEXT, " +
            "counters MAP<TEXT, INT>, " +
            "PRIMARY KEY (userid));"
        }
    ];
};

exports.down = function(){
    return [

    ];
};
