FROM	debian:bullseye

WORKDIR	/service

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			python3.10 \
			python3.10-pip \
			python3.10-dev \
			python3.10-wheel \
			build-essential \
			libpq-dev
		# && rm -rf /var/lib/apt/lists/*

RUN		pip3 install --no-cache-dir --upgrade pip \
		&& pip3 install --no-cache-dir gunicorn
