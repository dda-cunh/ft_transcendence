FROM	python:3.11-slim

WORKDIR	/service

RUN		apt-get update -y \
		apt-get upgrade -y \
		&& apt-get install -y \
			build-essential \
			libpq-dev \
		&& rm -rf /var/lib/apt/lists/*

RUN		pip install --no-cache-dir --upgrade pip \
		&& pip install --no-cache-dir gunicorn

RUN		groupadd -r django && useradd -r -g django django

USER	django

CMD		["gunicorn", "--help"]
