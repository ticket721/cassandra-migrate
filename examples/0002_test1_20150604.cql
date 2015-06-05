--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_activity (
            userid TIMEUUID,
            activity TEXT,
            PRIMARY KEY (userid)
        );
    --</cql>
--</up>
--<down>
    --<cql>
        DROP TABLE user_activity;
    --</cql>
--</down>
