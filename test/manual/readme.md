This is just some info on running a simple live test.

Clean up the database:

```
delete from api_key;
delete from application;
```

At this point it would be good to delete uploaded files as well.

Add an API key:

```
insert into api_key (value, enabled, allow_admin_read, allow_admin_write, allow_read) values ('fake', 1, 1, 1, 1);
```

Run script:

```
./run.sh
```
