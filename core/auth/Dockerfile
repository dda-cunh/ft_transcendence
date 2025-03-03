FROM	gunicorn-base:latest

ENV PYTHONPATH="/service/core:${PYTHONPATH}"

COPY	docker_exec.sh .

CMD 	["bash", "docker_exec.sh"]
