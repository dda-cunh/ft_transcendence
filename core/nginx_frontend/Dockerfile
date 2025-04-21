# nginx/Dockerfile
FROM    debian:bullseye

# # Update the package list and install openssl and nginx
RUN apt-get update && \
    apt-get install -yq nginx openssl wget unzip && \
    rm -rf /var/lib/apt/lists/*

# # Copy the Nginx configuration file
RUN rm -f /etc/nginx/sites-enabled/default
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/www/html && \
    cd /var/www/html && \
    mkdir -p css js fonts

RUN mkdir -p /etc/nginx/ssl
# Generate a self-signed certificate

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=PT/ST=Lisbon/L=Lisbon/O=42/OU=42/CN=ft_transcendance.42.fr"

RUN chmod 600 /etc/nginx/ssl/*

# Create log directories
RUN mkdir -p /var/log/nginx/transcendance/


# # Expose the port
EXPOSE 443
EXPOSE 80

# # Start the Nginx server
ENTRYPOINT ["nginx", "-g", "daemon off;"]

