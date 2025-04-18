FROM	gunicorn-base:latest

RUN 	set -eux; \
		apt-get update -y \
    	&& apt-get upgrade -y \
    	&& apt-get install -y \
			build-essential \
			zlib1g-dev \
			libjpeg-dev \
		&& rm -rf /var/lib/apt/lists/*


COPY	docker_exec.sh .
#EXPOSE	8000

CMD 	["bash", "docker_exec.sh"]
