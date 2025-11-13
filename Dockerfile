FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application files
COPY server.js ./
COPY public ./public

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]

