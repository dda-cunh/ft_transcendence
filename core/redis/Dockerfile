FROM	debian:bullseye-slim

RUN		set -eux; \
		apt-get update -y; \
		apt-get upgrade -y; \
		apt-get install -y \
			redis-server;

COPY	redis_conf.sh .

CMD 	["bash", "redis_conf.sh"]
