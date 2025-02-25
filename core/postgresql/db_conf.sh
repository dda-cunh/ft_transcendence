#!/bin/bash

db_is_setup="${HOME}/.is_setup"

if [ ! -f $db_is_setup ]; then
	initdb -D $PGDATA

    echo "listen_addresses='*'" >> "$PGDATA/postgresql.conf"
    echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"

    pg_ctl -D $PGDATA start

    psql --username=postgres --command "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
    psql --username=postgres --command "CREATE DATABASE $DB_NAME;"
    psql --username=postgres --command "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

    pg_ctl -D $PGDATA stop

	touch $db_is_setup
fi

postgres -D $PGDATA -p $DB_PORT -h "0.0.0.0"

