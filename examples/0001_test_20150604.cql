--<up>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_email (
             email TEXT,
             alternate_email MAP<TEXT, TEXT>,
             userid TIMEUUID,
             username TEXT,
            PRIMARY KEY (email)
        );
    --</cql>
    --<cql>
        CREATE TABLE IF NOT EXISTS user_by_id (
             userid TIMEUUID,
             email TEXT,
             alternate_email MAP<TEXT, TEXT>,
             username TEXT,
             PRIMARY KEY (userid)
        );
    --</cql>
--</up>
--<down>
    --<cql>
        DROP TABLE user_by_email;
    --</cql>
    --<cql>
        DROP TABLE user_by_id;
    --</cql>
--</down>