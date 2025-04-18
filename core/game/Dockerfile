FROM	gunicorn-base:latest

WORKDIR	/service

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			build-essential \
			zlib1g-dev \
			libjpeg-dev \ 
		&& rm -rf /var/lib/apt/lists/*

RUN		pip install --no-cache-dir --upgrade daphne channels

CMD 	["bash", "docker_exec.sh"]
