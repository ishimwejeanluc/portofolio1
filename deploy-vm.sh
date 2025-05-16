#!/bin/bash

# Build and push Docker images
echo "Building and pushing Docker images..."
docker build -t ishimwejeanluc/portfolio-app:latest .
docker push ishimwejeanluc/portfolio-app:latest

# SSH into VM and deploy
echo "Deploying to VM..."
ssh ubuntu@192.168.1.72 << 'EOF'
# Create project directory if it doesn't exist
mkdir -p /var/www/portofolio1

# Initialize Docker Swarm if not already initialized
if ! docker info | grep -q "Swarm: active"; then
    docker swarm init --advertise-addr 192.168.1.72
fi

# Create required directories for Traefik
mkdir -p /var/www/portofolio1/traefik
EOF

# Copy necessary files to VM
echo "Copying configuration files to VM..."
scp docker-compose.prod.yml ubuntu@192.168.1.72:/var/www/portofolio1/
scp -r traefik/* ubuntu@192.168.1.72:/var/www/portofolio1/traefik/
scp database.sql ubuntu@192.168.1.72:/var/www/portofolio1/

# Deploy the stack
ssh ubuntu@192.168.1.72 << 'EOF'
cd /var/www/portofolio1

# Deploy the stack
docker stack deploy -c docker-compose.prod.yml portfolio

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service status
docker service ls
EOF

echo "Deployment complete! Check the services with: ssh ubuntu@192.168.1.72 'docker service ls'"
