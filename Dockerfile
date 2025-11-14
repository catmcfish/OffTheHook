FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy server file
COPY server.js ./

# Copy frontend files (from root, which are in git)
COPY index.html game.js style.css config.js ./

# Copy js/ directory (client-side modules)
COPY js/ ./js/

# Create public directory and copy files
RUN mkdir -p public && \
    mkdir -p public/js && \
    cp index.html game.js style.css config.js public/ && \
    cp -r js/* public/js/

# Verify files are copied
RUN ls -la public/

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]

