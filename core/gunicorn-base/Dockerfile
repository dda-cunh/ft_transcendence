FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
    apt-get upgrade \
    && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev

RUN pip install --no-cache-dir gunicorn

ENTRYPOINT ["bash"]
