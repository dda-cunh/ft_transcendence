FROM	debian:bullseye-slim

WORKDIR	/service

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			python3 \
			python3-pip \
			python3-dev \
			python3-wheel \
			build-essential \
			libpq-dev \
		&& rm -rf /var/lib/apt/lists/*
RUN		pip install --no-cache-dir --upgrade pip \
		&& pip install --no-cache-dir gunicorn
