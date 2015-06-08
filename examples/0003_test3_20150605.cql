--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_username_3 (
             email TEXT,
             alternate_email MAP<TEXT, TEXT>,
             userid TIMEUUID,
             username TEXT,
            PRIMARY KEY (username)
        );
    --</cql>
--</up>
--<down>
    --<cql>
        DROP TABLE user_by_username_3;
    --</cql>
--</down>