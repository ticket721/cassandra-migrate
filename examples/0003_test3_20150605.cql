--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_username (
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
        DROP TABLE user_by_username;
    --</cql>
--</down>