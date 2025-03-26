FROM	gunicorn-base:latest

RUN		set -eux; \
		apt-get update; \
		apt-get install -y \
			zlib1g-dev \
			libjpeg-dev;

COPY	docker_exec.sh .

CMD 	["bash", "docker_exec.sh"]
