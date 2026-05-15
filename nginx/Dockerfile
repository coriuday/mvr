FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directory
RUN mkdir -p /var/log/nginx /var/www/certbot

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
