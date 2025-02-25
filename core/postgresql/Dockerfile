FROM	debian:bullseye

ENV		PG_VERSION	13
ENV		PG_MAJOR	13
ENV		PGDATA		/var/lib/postgresql/data
ENV		PATH		/usr/lib/postgresql/$PG_MAJOR/bin:$PATH

RUN		set -eux; \
		apt-get update -y; \
		apt-get upgrade -y; \
		apt-get install -y \
			postgresql-$PG_MAJOR;

USER	postgres
RUN		install --verbose --directory --owner=postgres --group=postgres --mode=0700 $PGDATA

COPY	db_conf.sh .

CMD 	["bash", "db_conf.sh"]
