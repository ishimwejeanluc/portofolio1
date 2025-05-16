FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Make sure the public directory exists
RUN mkdir -p public/css public/js public/images

# Verify that views directory exists
RUN ls -la views || mkdir -p views

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
