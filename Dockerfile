FROM node:22-alpine

# Install PostgreSQL client for pg_isready and dos2unix for line ending conversion
RUN apk add --no-cache postgresql-client dos2unix

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy entrypoint script and fix line endings
COPY docker-entrypoint.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the port Next.js runs on
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]