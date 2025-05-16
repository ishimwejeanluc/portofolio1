# Dynamic Portfolio System with Docker and Traefik Load Balancing

This repository contains a dynamic portfolio system deployed using Docker containers with Traefik for load balancing.

## Features

- Containerized Node.js application and MySQL database
- Load balancing with Traefik
- High availability across multiple nodes
- TLS encryption with Let's Encrypt
- Security mechanisms including:
  - Basic Authentication
  - API Key Authentication
  - Rate Limiting
  - IP Whitelisting
  - Secure Headers

## Prerequisites

- Docker and Docker Compose installed
- Docker Swarm for production deployment (multi-node setup)
- Domain name for production deployment (for Let's Encrypt)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ishimwejeanluc/portofolio1.git
   cd portofolio1
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://portfolio.localhost

## Production Deployment

### Initialize Docker Swarm

1. On your main node (Ubuntu server):
   ```bash
   docker swarm init --advertise-addr <MANAGER-IP>
   ```

2. This will output a command to add worker nodes. Run this command on your CentOS/RedHat server.

### Deploy the Stack

1. Create the necessary directories for Traefik configuration on the manager node:
   ```bash
   mkdir -p traefik/certificates
   chmod 600 traefik/acme.json
   ```

2. Copy the configuration files to the manager node.

3. Update the domain name in `docker-compose.prod.yml` (replace `portfolio.yourdomain.com` with your actual domain).

4. Deploy the stack:
   ```bash
   docker stack deploy -c docker-compose.prod.yml portfolio
   ```

### Verify Deployment

```bash
docker stack services portfolio
```

## Security Features

### TLS Encryption
Traefik is configured to use Let's Encrypt for automatic TLS certificate generation and renewal.

### Authentication
- Basic Authentication for admin area (/admin)
- API Key Authentication for API endpoints (/api)

### Additional Security
- Rate limiting to prevent abuse
- IP whitelisting for sensitive areas
- Secure HTTP headers
- TLS hardening

## High Availability

The application is configured to run multiple replicas across the swarm nodes, ensuring high availability. If one node fails, the traffic will be automatically routed to the remaining healthy nodes.

## Scaling

To scale the application:

```bash
docker service scale portfolio_app=5
```

## Monitoring

Access the Traefik dashboard at http://your-server-ip:8080 to monitor the health and traffic of your services.

## License

MIT