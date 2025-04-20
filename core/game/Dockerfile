FROM	python:3.11-slim

WORKDIR	/service

RUN		apt-get update -y \
		&& apt-get upgrade -y \
		&& apt-get install -y \
			build-essential \
			zlib1g-dev \
			libjpeg-dev \ 
		&& rm -rf /var/lib/apt/lists/*

RUN		pip install --no-cache-dir --upgrade pip wheel \
		&& pip install --no-cache-dir --upgrade daphne channels

CMD 	["bash", "docker_exec.sh"]
