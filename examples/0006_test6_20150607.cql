--<up>
    --<cql>
        insert into user_by_facebook_4(facebook_id, username) values('1', 'karan');
    --</cql>
--</up>
--<down>
    --<cql>
        delete from user_by_facebook_4 where facebook_id = '1';
    --</cql>
--</down>