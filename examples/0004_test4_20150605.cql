--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_facebook (
             email TEXT,
             facebook_id TEXT,
             userid TIMEUUID,
             username TEXT,
            PRIMARY KEY (facebook_id)
        );
    --</cql>
--</up>
--<down>
    --<cql>
        DROP TABLE user_by_facebook;
    --</cql>
--</down>