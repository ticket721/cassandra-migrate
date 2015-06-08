--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_activity_2 (
            userid TIMEUUID,
            activity TEXT,
            PRIMARY KEY (userid)
        );
    --</cql>
--</up>
--<down>
    --<cql>
        DROP TABLE user_activity_2;
    --</cql>
--</down>
