FROM	gunicorn-base:latest

RUN		set -eux; \
		apt-get update; \
		apt-get install -y \
		build-essential \
		zlib1g-dev \
		libjpeg-dev;
		
RUN		pip install --no-cache-dir --upgrade pip wheel

COPY	docker_exec.sh .
EXPOSE	8000

CMD 	["bash", "docker_exec.sh"]
