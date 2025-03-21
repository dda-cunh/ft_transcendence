FROM	gunicorn-base:latest

RUN		set -eux; \
		apt-get update; \
		apt-get install -y \
			zlib1g-dev \
			libjpeg-dev \ 
			netcat-openbsd \
		&& rm -rf /var/lib/apt/lists/*

COPY wait-for.sh /usr/local/bin/wait-for.sh
RUN chmod +x /usr/local/bin/wait-for.sh

COPY	docker_exec.sh .

CMD 	["bash", "docker_exec.sh"]
