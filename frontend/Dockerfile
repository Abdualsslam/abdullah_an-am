# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy the rest of the application files
COPY . .

# Build the application using Vite
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Configure Nginx for React Router SPA (redirect all requests to index.html)
RUN sed -i 's|index  index.html index.htm;|index  index.html index.htm; try_files $uri $uri/ /index.html;|' /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check to ensure Nginx is serving the app
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
