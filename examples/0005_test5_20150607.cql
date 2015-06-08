--<up>
    --<cql>
        insert into user_by_username_3(username, userid) values('karan', 8f8ea390-0d9b-11e5-bd74-f1607e3014b3);
    --</cql>
--</up>
--<down>
    --<cql>
        delete from user_by_username_3 where username = 'karan';
    --</cql>
--</down>