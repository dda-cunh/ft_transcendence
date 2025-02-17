FROM	debian:bullseye

RUN		apt-get update -y \
		&& apt-get upgrade -y \
		&& apt-get install -y \
			postgresql \
			postgresql-common

RUN		service postgresql start

USER	postgres

COPY	db_conf.sh .

CMD 	["bash", "db_conf.sh"]
