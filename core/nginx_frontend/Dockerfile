# nginx/Dockerfile
FROM	debian:bookworm-slim

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

RUN wget https://github.com/twbs/bootstrap/releases/download/v5.3.3/bootstrap-5.3.3-dist.zip -O /tmp/bootstrap.zip && \
    unzip /tmp/bootstrap.zip -d /tmp/bootstrap && \
    cp /tmp/bootstrap/bootstrap-*/css/bootstrap.min.css /var/www/html/css/ && \
    cp /tmp/bootstrap/bootstrap-*/js/bootstrap.bundle.min.js /var/www/html/js/ && \
    rm -rf /tmp/bootstrap*

# Download Bootstrap Icons (fixed)
RUN wget https://github.com/twbs/icons/releases/download/v1.11.3/bootstrap-icons-1.11.3.zip -O /tmp/icons.zip && \
    unzip /tmp/icons.zip -d /tmp/icons && \
    # Download the CSS file from CDN
    wget https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css -O /var/www/html/css/bootstrap-icons.min.css && \
    # Copy font files
    cp /tmp/icons/bootstrap-icons-1.11.3/font/fonts/* /var/www/html/fonts/ && \
    rm -rf /tmp/icons*

RUN mkdir -p /etc/nginx/ssl
# Generate a self-signed certificate

RUN openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=PT/ST=Lisbon/L=Lisbon/O=42/OU=42/CN=transcendance"


RUN chmod 600 /etc/nginx/ssl/*

# Create log directories
RUN mkdir -p /var/log/nginx/transcendance/


# # Expose the port
EXPOSE 443
EXPOSE 80

# # Start the Nginx server
ENTRYPOINT ["nginx", "-g", "daemon off;"]

