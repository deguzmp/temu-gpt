# Use the official lightweight Nginx image
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom configuration into the container
COPY default.conf /etc/nginx/conf.d/

# Expose port 8080 to the outside world
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]