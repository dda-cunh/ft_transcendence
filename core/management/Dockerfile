FROM	gunicorn-base:latest

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			build-essential \
			zlib1g-dev \
			libjpeg-dev \ 
			netcat-openbsd \
		&& rm -rf /var/lib/apt/lists/*

COPY	wait-for.sh /usr/local/bin/wait-for.sh
RUN		chmod +x /usr/local/bin/wait-for.sh

COPY	docker_exec.sh .

CMD 	["bash", "docker_exec.sh"] 