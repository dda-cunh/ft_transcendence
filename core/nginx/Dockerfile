FROM debian:11

RUN apt-get update && apt-get install -y nginx openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& mkdir /etc/nginx/ssl \
	&& chown www-data:www-data /var/www/html \
	&& openssl genrsa -out /etc/nginx/ssl/fmouronh.42.fr.key \
	&& openssl req -new -key /etc/nginx/ssl/fmouronh.42.fr.key -out /etc/nginx/ssl/fmouronh.42.fr.csr \
	-subj "/C=PT/ST=Lisbon/L=Lisbon/CN=fmouronh.42.fr" \
	&& openssl x509 -req -days 365 -in /etc/nginx/ssl/fmouronh.42.fr.csr \
	-signkey /etc/nginx/ssl/fmouronh.42.fr.key -out /etc/nginx/ssl/fmouronh.42.fr.crt \
	&& rm /var/www/html/index.nginx-debian.html

COPY conf/default /etc/nginx/sites-available/default
COPY conf/nginx.conf /etc/nginx/nginx.conf


EXPOSE 80/tcp
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
