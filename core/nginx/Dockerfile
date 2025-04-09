# nginx/Dockerfile
FROM    debian:bullseye

# # Update the package list and install openssl and nginx
RUN apt-get update && \
    apt-get install -yq nginx && \
    rm -rf /var/lib/apt/lists/*


# # Copy the Nginx configuration file
RUN rm -f /etc/nginx/sites-enabled/default
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

# Generate a self-signed certificate

# Create log directories
RUN mkdir -p /var/log/nginx/transcendance/
EXPOSE 8000
# # Start the Nginx server
ENTRYPOINT ["nginx", "-g", "daemon off;"]
