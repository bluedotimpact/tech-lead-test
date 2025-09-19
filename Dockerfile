FROM node:22-alpine

# Install PostgreSQL client for pg_isready
RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the port Next.js runs on
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]