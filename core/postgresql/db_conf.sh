#!/bin/bash

db_is_setup="${HOME}/.is_setup"

if [ ! -f $db_is_setup ]; then
    pg_createcluster $PG_CLUSTER

	pg_ctlcluster $PG_VERSION $PG_CLUSTER start

	psql --username=postgres --command "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
	psql --username=postgres --command "CREATE DATABASE $DB_NAME;"
	psql --username=postgres --command "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

	pg_ctlcluster $PG_VERSION $PG_CLUSTER stop

	echo "listen_addresses='*'" >> $PGDATA/postgresql.conf
	echo "host all all 0.0.0.0/0 md5" >> $PGDATA/pg_hba.conf

	touch $db_is_setup
fi

exec   /usr/lib/postgresql/$PG_VERSION/bin/pg_ctl -D $PGDATA start

