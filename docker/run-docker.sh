   docker run -d \
      -p 80:80 \
     --add-host=host.docker.internal:host-gateway \
      --name temu-gpt-container \
      nginx-proxy
