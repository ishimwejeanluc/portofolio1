#!/bin/bash

# Portfolio Docker Swarm Deployment Script
# This script helps deploy the portfolio application to a Docker Swarm cluster

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="portfolio"
MANAGER_IP=""
DOMAIN_NAME=""

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Portfolio Docker Swarm Deployment     ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Function to initialize swarm
initialize_swarm() {
    echo -e "\n${YELLOW}Initializing Docker Swarm...${NC}"
    
    # Check if already in swarm mode
    if docker info | grep -q "Swarm: active"; then
        echo -e "${GREEN}This node is already part of a swarm.${NC}"
        MANAGER_IP=$(docker info | grep "Node Address" | awk '{print $3}')
        echo -e "Manager IP: ${MANAGER_IP}"
    else
        # Get the IP address to advertise
        if [ -z "$MANAGER_IP" ]; then
            echo -e "${YELLOW}Enter the IP address to advertise for swarm (manager node):${NC}"
            read -p "> " MANAGER_IP
        fi
        
        # Initialize swarm
        docker swarm init --advertise-addr $MANAGER_IP
        echo -e "${GREEN}Swarm initialized successfully!${NC}"
    fi
    
    # Display join command for worker nodes
    echo -e "\n${YELLOW}Use the following command to add worker nodes to the swarm:${NC}"
    docker swarm join-token worker
}

# Function to prepare deployment files
prepare_deployment() {
    echo -e "\n${YELLOW}Preparing deployment files...${NC}"
    
    # Create directories for Traefik if they don't exist
    mkdir -p traefik/certificates
    
    # Set proper permissions for acme.json
    if [ -f "traefik/acme.json" ]; then
        chmod 600 traefik/acme.json
    else
        touch traefik/acme.json
        chmod 600 traefik/acme.json
    fi
    
    # Update domain name in docker-compose.prod.yml
    if [ -z "$DOMAIN_NAME" ]; then
        echo -e "${YELLOW}Enter your domain name (e.g., portfolio.example.com):${NC}"
        read -p "> " DOMAIN_NAME
    fi
    
    # Replace domain in docker-compose.prod.yml
    sed -i.bak "s/portfolio\.yourdomain\.com/$DOMAIN_NAME/g" docker-compose.prod.yml
    
    echo -e "${GREEN}Deployment files prepared successfully!${NC}"
}

# Function to build and push Docker images
build_images() {
    echo -e "\n${YELLOW}Building and pushing Docker images...${NC}"
    
    # Build images
    docker build -t ishimwejeanluc/portfolio-app:latest .
    docker build -t ishimwejeanluc/portfolio-mysql:latest -f Dockerfile.mysql .
    
    # Ask if user wants to push images to Docker Hub
    echo -e "${YELLOW}Do you want to push the images to Docker Hub? (y/n)${NC}"
    read -p "> " PUSH_IMAGES
    
    if [ "$PUSH_IMAGES" = "y" ] || [ "$PUSH_IMAGES" = "Y" ]; then
        echo -e "${YELLOW}Logging in to Docker Hub...${NC}"
        docker login
        
        # Push images
        docker push ishimwejeanluc/portfolio-app:latest
        docker push ishimwejeanluc/portfolio-mysql:latest
        
        echo -e "${GREEN}Images pushed to Docker Hub successfully!${NC}"
    else
        echo -e "${YELLOW}Skipping push to Docker Hub.${NC}"
    fi
}

# Function to deploy stack
deploy_stack() {
    echo -e "\n${YELLOW}Deploying stack to swarm...${NC}"
    
    # Deploy the stack
    docker stack deploy -c docker-compose.prod.yml $STACK_NAME
    
    echo -e "${GREEN}Stack deployed successfully!${NC}"
    
    # Display stack services
    echo -e "\n${YELLOW}Stack services:${NC}"
    docker stack services $STACK_NAME
}

# Function to display deployment info
display_info() {
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}  Deployment Information                ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    
    echo -e "${YELLOW}Stack Name:${NC} $STACK_NAME"
    echo -e "${YELLOW}Manager IP:${NC} $MANAGER_IP"
    echo -e "${YELLOW}Domain:${NC} $DOMAIN_NAME"
    
    echo -e "\n${YELLOW}Access your application at:${NC}"
    echo -e "http://$DOMAIN_NAME"
    echo -e "https://$DOMAIN_NAME"
    
    echo -e "\n${YELLOW}Access Traefik dashboard at:${NC}"
    echo -e "http://$MANAGER_IP:8080"
    
    echo -e "\n${YELLOW}API Endpoints:${NC}"
    echo -e "https://$DOMAIN_NAME/api/profile"
    echo -e "https://$DOMAIN_NAME/api/skills"
    echo -e "https://$DOMAIN_NAME/api/experience"
    
    echo -e "\n${YELLOW}Admin Area:${NC}"
    echo -e "https://$DOMAIN_NAME/admin"
    echo -e "Username: admin"
    echo -e "Password: admin123"
}

# Main menu
while true; do
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}  Deployment Menu                       ${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo -e "1. Initialize Docker Swarm"
    echo -e "2. Prepare Deployment Files"
    echo -e "3. Build and Push Docker Images"
    echo -e "4. Deploy Stack to Swarm"
    echo -e "5. Display Deployment Information"
    echo -e "6. Exit"
    
    read -p "Select an option (1-6): " OPTION
    
    case $OPTION in
        1)
            initialize_swarm
            ;;
        2)
            prepare_deployment
            ;;
        3)
            build_images
            ;;
        4)
            deploy_stack
            ;;
        5)
            display_info
            ;;
        6)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
done
