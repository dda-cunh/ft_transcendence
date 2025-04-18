FROM	debian:bookworm-slim

WORKDIR	/service

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			python3 \
			python3-venv \
			python3-dev \
			python3-wheel \
			build-essential \
			libpq-dev \
		&& rm -rf /var/lib/apt/lists/*

# Create a venv at /opt/venv and make it the default Python
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN		pip install --no-cache-dir --upgrade pip \
		&& pip install --no-cache-dir gunicorn
