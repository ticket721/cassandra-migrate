--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_facebook_4 (
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
        DROP TABLE user_by_facebook_4;
    --</cql>
--</down>